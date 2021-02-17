const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const lodash = require("lodash");
const mongoose = require("mongoose");

const homeStartingContent = "Hello! Welcome to my blog. I like to write about something with the themes of life, the universe and everything. I try to pack in analogies so it helps with visualising some wild theories I think of. Hope you have fun reading. Enjoy!";
const aboutContent = "Hello! My name is Varun Janardhanan. I am a budding web developer. I am passionate about making stuff. I am also keen to develop games as a hobby. I draw my own art and sometimes write about stuff in general.";
const contactContent = "You can contact me at varun3jr@gmail.com.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/blogDB", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
const postSchema = new mongoose.Schema({
  title: String,
  contentHTML: String,
  contentText: String
});
const Post = mongoose.model("Post", postSchema);

app.get("/", function(req, res) {
  Post.find({}, function(err, posts) {
    res.render("home", {title: "Home", startingContent: homeStartingContent, postList: posts});
  });
});

app.get("/about", function(req, res) {
  res.render("about", {title: "About me", startingContent: aboutContent});
});

app.get("/contact", function(req, res) {
  res.render("contact", {title: "Contact me", startingContent: contactContent});
});

app.get("/posts/:postId", function(req, res) {
  const requestedPostId = req.params.postId;
  Post.findOne({_id: requestedPostId}, function(err, post) {
    if(!err) {res.render("post", {heading: post.title, content: post.contentHTML});}
  });
});

app.get("/compose", function(req, res) {
  res.render("compose", {postId: "", title: "", content: ""});
});

app.post("/compose", function(req, res) {
  if(req.body.Id == "") {
    const post = new Post({
      title: req.body.Title,
      contentHTML: req.body.postContentHTML,
      contentText: req.body.postContentText
    });
    post.save(function(err) {
      if(!err) {res.redirect("/");}
    });
  }
  else {
    Post.findOneAndUpdate(
      { _id: req.body.Id },
      {
        title: req.body.Title,
        contentHTML: req.body.postContentHTML,
        contentText: req.body.postContentText
      },
      {
        upsert: true,
      },
      function(err, post) {
        if(!err) {
          if(post) {res.redirect("/");}
        }
      }
    );
  }
});

app.get("/edit", function(req, res) {
  Post.find({}, function(err, posts) {
    res.render("edit", {postList: posts});
  });
});

app.get("/edit/:postId", function(req, res) {
  Post.findById(req.params.postId, function(err, post) {
    res.render("compose", {postId: post._id, title: post.title, content: post.contentHTML});
  });
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
