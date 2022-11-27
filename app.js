const express = require("express");
const { escapeRegExp } = require("lodash");
const app = express();
const PORT = process.env.PORT || 3000;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bodyParser = require("body-parser");
const _ = require("lodash");

// BodyParser Middle Ware
app.use(bodyParser.urlencoded({ extended: true }));

// Use public folder as static folder
app.use(express.static("public"));

// Connect to DB
mongoose.connect("mongodb://localhost:27017/journalDB", (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Connected Successfully To DB");
  }
});
// Create Mongoose Schema
const postSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});
// Create Mongoose Model
const Post = mongoose.model("Post", postSchema);
// Get Data From DB

// set the view engine to ejs
app.set("view engine", "ejs");

// home Page
app.get("/", (req, res) => {
  res.render("home.ejs");
});

// Send data to /journal route
app.get("/journal", (req, res) => {
  Post.find({}, (err, posts) => {
    if (err) {
      console.log(err);
    } else {
      var posts = posts;
    }
    res.render("journal.ejs", { posts: posts });
  });
});

// Post Routes
Post.find({}, (err, posts) => {
  app.get("/:postTitle", (req, res) => {
    var requestedRoute = _.kebabCase(_.lowerCase(req.params.postTitle));
    var storedTitles = [];
    posts.forEach((post) => {
      storedTitles.push(post.title);
    });
    storedTitles.forEach((storedTitle) => {
      if (requestedRoute === _.kebabCase(_.lowerCase(storedTitle))) {
        Post.find({ title: storedTitle }, (err, posts) => {
          posts.forEach((post) => {
            var storedContent = post.content;
            res.render("posts.ejs", {
              title: storedTitle,
              content: storedContent,
            });
          });
        });
      }
    });
  });
});

// about
app.get("/about", (req, res) => {
  res.render("about.ejs");
});

// Compose
app.get("/compose", (req, res) => {
  res.render("compose.ejs");
});
app.post("/compose", (req, res) => {
  title = req.body.title;
  content = req.body.content;
  if (title === "" || content === "") {
    res.redirect("/compose");
  } else {
    Post.create({
      title: title,
      content: content,
    });
    res.redirect("/");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
