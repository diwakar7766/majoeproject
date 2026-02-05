const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");

const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const ListingController = require("../controllers/listings.js");
const storage = require("../cloudConfig.js");
const multer  = require("multer");

const upload = multer({ storage });

router.route("/")
    .get(wrapAsync(ListingController.index))
    .post( isLoggedIn,
         upload.single("listing[image]"), 
         validateListing,
         wrapAsync(ListingController.createListing));


// ✅ NEW route
router.get("/new", isLoggedIn, ListingController.renderNewForm);
router.route("/:id")
    .get(wrapAsync(ListingController.showListing))
    .put(isLoggedIn,
        isOwner, 
         upload.single("listing[image]"), 
        validateListing, wrapAsync(ListingController.updateListing))
    .delete(isLoggedIn, isOwner,
        wrapAsync(ListingController.distroyListing));

// ✅ EDIT route
router.get("/:id/edit", isLoggedIn, isOwner,
    wrapAsync(ListingController.renderEditEorm));


module.exports = router;
