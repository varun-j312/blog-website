const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const lodash = require("lodash");
const mongoose = require("mongoose");
const moment = require("moment");

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
  tags: String,
  contentHTML: String,
  contentText: String,
  timeStamp: String,
  author: String
});
const Post = mongoose.model("Post", postSchema);

app.get("/", function(req, res) {
  Post.find({}, function(err, posts) {
    res.render("home", {title: "Home", startingContent: homeStartingContent, postList: posts, moment: moment, formRoute: "/search", linkRoute: "/posts", linkAction: "Read more"});
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
    if(!err) {res.render("post", {post: post, moment: moment});}
  });
});

app.get("/compose", function(req, res) {
  res.render("compose", {postId: "", title: "", tags: "", content: ""});
});

app.post("/compose", function(req, res) {
  if(req.body.Id == "") {
    const post = new Post({
      title: req.body.Title,
      tags: req.body.Tags,
      contentHTML: req.body.postContentHTML,
      contentText: req.body.postContentText,
      timeStamp: moment().format("YYYYMMDDHHmmss"),
      author: "Varun"
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
        tags: req.body.Tags,
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
    res.render("home", {title: "Editing page", startingContent: "Click on edit to edit a post", postList: posts, moment: moment, formRoute: "/edit/search", linkRoute: "/edit", linkAction: "Edit"});
  });
});

app.get("/edit/:postId", function(req, res) {
  Post.findById(req.params.postId, function(err, post) {
    res.render("compose", {postId: post._id, title: post.title, tags: post.tags, content: post.contentHTML});
  });
});

app.get("/search/:searchItem", function(req, res) {
  let searchItem = req.params.searchItem;
  let queriedPosts = [];
  let queriedTags = searchItem.match(/\w+/g);
  Post.find({}, function(err, posts) {
    posts.forEach(function(post) {

      if(searchItem.includes("[")) {
        for(tag=0; tag<queriedTags.length; tag++) {
          if(post.tags.toLowerCase().includes(queriedTags[tag].toLowerCase())) { if(tag==queriedTags.length-1) { queriedPosts.push(post); } }
          else { break; }
        }
      }

      else {
        if(post.title.toLowerCase().includes(searchItem.toLowerCase())) { queriedPosts.push(post); }
      }
    });

    res.render("home", {title: "Search results for:", startingContent: searchItem, postList: queriedPosts, moment: moment, formRoute: "/search", linkRoute: "/posts", linkAction: "Read more"});
  });
});

app.post("/search", function(req, res) {

  res.redirect("/search/"+req.body.search);
});

app.post("/edit/search", function(req, res) {
  let searchItem = req.body.search;
  let queriedPosts = [];
  let queriedTags = searchItem.match(/\w+/g);
  Post.find({}, function(err, posts) {
    posts.forEach(function(post) {

      if(searchItem.includes("[")) {
        for(tag=0; tag<queriedTags.length; tag++) {
          if(post.tags.toLowerCase().includes(queriedTags[tag].toLowerCase())) { if(tag==queriedTags.length-1) { queriedPosts.push(post); } }
          else { break; }
        }
      }

      else {
        if(post.title.toLowerCase().includes(searchItem.toLowerCase())) { queriedPosts.push(post); }
      }
    });

    res.render("home", {title: "Editing page", startingContent: "Click on edit to edit a post", postList: queriedPosts, moment: moment, formRoute: "/edit/search", linkRoute: "/edit", linkAction: "Edit"});
  });
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
