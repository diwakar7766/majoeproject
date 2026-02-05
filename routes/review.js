const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");

const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

const reviewController = require("../controllers/review.js");



// Reviews POST rout
router.post("/", validateReview, isLoggedIn, wrapAsync(reviewController.createReview));

// Delete Reviews Rout
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.distroyReview)
);

module.exports = router;
