if (process.env.NODE_ENV != "production") {
    require('dotenv').config()
}

console.log(process.env.SECRET)

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user.js");
const flash = require("connect-flash");


const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const app = express();

const dburl = process.env.ATLASDB_URL;

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

async function main() {
    await mongoose.connect(dburl);
    console.log("connected to DB");
}
main().catch(err => console.log(err));

const store = MongoStore.create({
    mongoUrl: dburl,
    secret: process.env.SECRET,
    touchAfter: 24 * 3600
});

store.on("error", function (err) {
    console.log("SESSION STORE ERROR", err);
});

const sessionOptions = {
    store,
     secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
};

app.use((req, res, next) => {
    res.locals.currUser = req.user || null;
    next();
});


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/", (req, res) => {
//     res.send("Hi, I am rout");
// });

// routes
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

app.use((req, res, next) => {
    if (req.originalUrl === "/favicon.ico") {
        return res.status(204).end();
    }
    const error = new ExpressError(404, "Page Is Not Found!");
    next(error);
});

// global error handler
app.use((err, req, res, next) => {
    console.error(err);
    let { status = 500, message = "Something went wrong! Please try again." } = err;
    res.status(status).render("error.ejs", { status, message });
});


app.listen(8080, () => {
    console.log("Server listening on port 8080");
});
