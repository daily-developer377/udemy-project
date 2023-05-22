const express = require("express");
const router = express.Router({ mergeParams: true });
// review model
const Review = require("../models/review");
// end review model
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/expressError");
const { reviewSchema } = require("../schemas");
const Campground = require("../models/campground");

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
router.post(
  "/",
  validateReview,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review); //pushing new review into campground model in that campground model we set it in reviews
    await review.save();
    await campground.save();
    req.flash("success", "Review Added Successfully");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.delete(
  "/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Deleted Review Successfully");
    res.redirect(`/campgrounds/${id}`);
  })
);

module.exports = router;
