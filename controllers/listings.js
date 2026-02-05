const Listing = require("../models/listing");
const axios = require("axios");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
};


module.exports.renderNewForm = (req, res) => {
    res.render("listings/new");
};

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: { path: "author" },
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings");
    }

    res.render("listings/show", { listing });
};

module.exports.createListing = async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    const geoRes = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
            params: {
                q: newListing.location,
                format: "json",
                limit: 1
            },
            headers: { "User-Agent": "Wanderlust" }
        }
    );

   if (geoRes.data.length === 0) {
    req.flash("error", "Please enter a valid location");
    return res.redirect("/listings/new");
}

newListing.geometry = {
    type: "Point",
    coordinates: [
        parseFloat(geoRes.data[0].lon),
        parseFloat(geoRes.data[0].lat)
    ]
};

    await newListing.save();
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
};

module.exports.renderEditEorm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_250,w_250");

    res.render("listings/edit", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;

    let listing = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });
    if (req.body.listing.location) {
    const geoRes = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
            params: {
                q: req.body.listing.location,
                format: "json",
                limit: 1
            },
            headers: { "User-Agent": "Wanderlust" }
        }
    );

    if (geoRes.data.length === 0) {
        req.flash("error", "Invalid location");
        return res.redirect(`/listings/${id}/edit`);
    }

    listing.geometry = {
        type: "Point",
        coordinates: [
            parseFloat(geoRes.data[0].lon),
            parseFloat(geoRes.data[0].lat)
        ]
    };

    await listing.save();
}


    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing updated successfully");
    res.redirect(`/listings/${id}`);
};

module.exports.distroyListing = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted !");
    res.redirect("/listings");
};
