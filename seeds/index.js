const path = require("path");
const cities = require("./cities");
const mongoose = require("mongoose");
const campground = require("../models/campground");
const { places, description, descriptors } = require("./seedHelpers");
mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-camp", {
    // useNewParser: true,
    // useCreateIndex: true,
    // useUnifiedTopology: true
  })
  .then(() => {
    console.log("dbs connected");
  })
  .catch((err) => {
    console.log("Error occured");
    console.log(err);
  });

const sample = array => array[Math.floor(Math.random() * array.length )];

const seedDB = async () => {
  await campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new campground({
      location: `${cities[random1000].city},${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      image: "http://source.unsplash.com/collection/483251",
      description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Et esse accusamus id voluptates aut rerum quaerat harum nostrum quibusdam in architecto eaque suscipit, exercitationem possimus officiis omnis tenetur magni obcaecati.",
      price
    });
    console.log(camp);
    await camp.save();
  }
};

seedDB().then(()=>{
    mongoose.connection.close()
});
