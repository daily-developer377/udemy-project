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
const Joi = require("joi");
const { campgroundSchema } = require("./schemas");
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

app.engine("ejs", ejsMate); //to enable boiler plate
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method")); //use for method override so we can use _method while using methodOverride
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("home");
});

// app.get("/campground", async (req, res) => {
//   const camp = new campground({
//     title: "My Backyard",
//     description: "cheap camping",
//   });
//   // await camp.save();
//   res.send(camp);
// });

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

app.get(
  "/campgrounds",
  catchAsync(async (req, res) => {
    const campgrounds = await campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

app.post(
  "/campgrounds",
  validateCampground,
  catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.Campground);
    console.log(campground);
    // console.log(req.body);
    await campground.save();
    console.log(campground);
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

app.get(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/show", { campground });
  })
);

app.get(
  "/campgrounds/:id/edit",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground });
  })
);

app.put(
  "/campgrounds/:id",
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    // console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.Campground,
    });
    // console.log(campground)
    res.redirect(`/campgrounds/${campground._id}`);
    // res.send("www")
  })
);

app.delete(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

// app.use((err, req, res, next) => {
//   res.send("hoo boy something went wrong");
// });

app.listen("3000", () => {
  console.log("Server started localhost 3000");
});
