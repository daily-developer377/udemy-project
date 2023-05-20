// const { request } = require("express");
const express = require("express");
const app = express();
const path = require("path");
const Campground = require("./models/campground");
const mongoose = require("mongoose");
const campground = require("./models/campground");
const { Console } = require("console");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const catchAsync = require("./utils/catchAsync");
// const joi = require("joi");
const ExpressError = require("./utils/expressError");
// const Joi = require("joi");
// review model
const Review = require("./models/review");
// end review model
const { campgroundSchema, reviewSchema } = require("./schemas");
mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-camp", {
    // useNewParser: true,
    // useCreateIndex: true,
    // useUnifiedTopology: true
  })
  .then(() => {
    console.log("db connected");
  })
  .catch((err) => {
    console.log("Error occured");
    console.log(err);
  });

const campgrounds = require("./routes/campground");   //requiring routes of campground

app.engine("ejs", ejsMate); //to enable boiler plate
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method")); //use for method override so we can use _method while using methodOverride
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/campgrounds",campgrounds)

app.get("/", (req, res) => {
  res.render("home");
});

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

app.post(
  "/campgrounds/:id/reviews",
  validateReview,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review); //pushing new review into campground model in that campground model we set it in reviews
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

app.delete(
  "/campgrounds/:id/reviews/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
  })
);

// error temp based
app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "something went wrong";
  res.status(statusCode).render("campgrounds/error.ejs", { err });
});


app.listen("3000", () => {
  console.log("Server started localhost 3000");
});
