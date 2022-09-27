const express = require("express");
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const apicache = require('apicache')
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");

const cache = apicache.middleware
// get all users in the database
router.get("/users", ensureAuth, async (req, res) => {
  const pages  = req.query.pages || 0
  const usersPerPage = 3
  try {
    let users = await User.find()
    .skip(pages * usersPerPage)
    .limit(usersPerPage)
    if (!users) {
      res.status(400).json({ message: "No User found" });
    } else {
      res.status(200).json(users);
    }
  } catch (error) {
    console.log(error);
  }
});

// get a single user
router.get("/user/:id", cache('1 minutes'), ensureAuth, async (req, res) => {
  try {
    let user = await User.findById({ _id: req.params.id });
    if (!user) {
      res.status(400).json({ message: "User does not exist" });
    } else {
      res.status(200).json(user);
    }
  } catch (error) {
    console.log(error);
  }
});

// using query parameters
router.get("/user", async (req, res) => {
  const { name, email } = req.query;
  let user = await User.find({ name, email });
  res.json(user);
});

// create a post
router.post("/post", ensureAuth,  cache('1 minutes'), async (req, res) => {
  const { title, body } = req.body;
  try {
    let post = await Post.create({
      title,
      body,
      user: req.user.id,
    });
    res.status(201).json(post);
  } catch (error) {
    console.log(error);
  }
});

// get all posts of single user
router.get("/posts", ensureAuth, cache('1 minutes'), async (req, res) => {
  try {
    let posts = await Post.find({ user: req.user.id });
    let comments = await Comment.find({ user: req.user.id });
    if (!posts) {
      res.status(404).json({ message: "this user has no post" });
    } else if (posts == "") {
      res.status(200).json({ posts: "this user has no post ", comments });
    } else if (comments == "") {
      res.status(200).json({ posts, comments: "this user has no comment" });
    } else {
      res.status(200).json({ posts, comments });
    }
  } catch (error) {
    console.log(error);
  }
});

// get post and comment
router.get("/post/:id", ensureAuth, cache('1 minutes'), async (req, res) => {
  try {
    let posts = await Post.findById({ _id: req.params.id });
    let comments = await Comment.find({ post: req.params.id })
      .select("-_id -post")
      .sort({ createdAt: -1 });
    if (!posts) {
      res.status(404).json({ message: "no post available" });
    } else if (comments == "") {
      res.json({ posts, comments: "this post has no comment" });
    } else {
      res.status(200).json({ title: posts.title, user: posts.user, comments });
    }
  } catch (error) {
    console.log(error);
  }
});

// get a single post of a user
router.get("/post/:id", ensureAuth, cache('1 minutes'), async (req, res) => {
  try {
    let post = await Post.findById({ _id: req.params.id });
    if (!post) {
      res.status(404).json({ message: "no post available" });
    } else if (req.user.id != post.user) {
      res.status(400).json({ message: "you cant view this post" });
    } else {
      res.status(200).json(post);
    }
  } catch (error) {
    console.log(error);
  }
});

// edit a post
router.put("/post/:id", ensureAuth, cache('1 minutes'), async (req, res) => {
  try {
    let post = await Post.findById({ _id: req.params.id });
    if (!post) {
      res.status(404).json({ message: "this user has no post" });
    } else if (req.user.id != post.user) {
      res.status(400).json({ message: "you cant edit this post" });
    } else {
      post = await Post.findByIdAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      });
      res.status(201).json(post);
    }
  } catch (error) {
    console.log(error);
  }
});

// delete a post

router.delete("/post/:id", ensureAuth, cache('1 minutes'), async (req, res) => {
  try {
    let post = await Post.findById({ _id: req.params.id });
    if (!post) {
      res.status(404).json({ message: "post does not exist" });
    } else if (req.user.id != post.user) {
      res.status(400).json({ message: "you cant delete this post" });
    } else {
      post = await Post.findByIdAndDelete({ _id: req.params.id });
      res.status(200).json({ message: post.title + " deleted succesfully" });
    }
  } catch (error) {
    console.log(error);
  }
});

// create a comment
router.post("/post/:id/comment", ensureAuth, cache('1 minutes'), async (req, res) => {
  const { body } = req.body;
  try {
    let post = await Post.findById({ _id: req.params.id });
    let comment = await Comment.create({
      body,
      user: req.user.id,
      post: req.params.id,
    });
    res.status(201).json({
      body: comment.body,
      post_title: post.title,
      user: req.user.id,
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
