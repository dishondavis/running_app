const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const moment = require('moment')


module.exports = {
  getProfile: async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id });
      res.render("profile.ejs", { posts: posts, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getFeed: async (req, res) => {
    try {
      const posts = await Post.find().sort({ createdAt: "desc" }).lean();
      res.render("feed.ejs", { posts: posts });
    } catch (err) {
      console.log(err);
    }
  },
  getPost: async (req, res) => {
    try {
      console.log(req.query);
      const post = await Post.findById(req.params.id);
      const postDateTime = moment(post.day +' '+ post.time)
      console.log(postDateTime);
      res.render("post.ejs", { post: post, user: req.user, edit: req.query.edit, postDateTime: postDateTime });
    } catch (err) {
      console.log(err);
    }
  },
  createPost: async (req, res) => {
    try { console.log(req.body, "createPost");
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);

      await Post.create({
        time: req.body.time,
        day: req.body.day,
        location: req.body.location,
        image: result.secure_url,
        cloudinaryId: result.public_id,
        likes: 0,
        user: req.user.id,
      });
      console.log("Post has been added!");
      res.redirect("/profile");
    } catch (err) {
      console.log(err);
    }
  },
  likePost: async (req, res) => {
    try { console.log(req.body, "likePost");
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
        }
      );
      console.log("Likes +1");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  updatePost: async (req, res,) => {
    try{ console.log(req.body, 'updatePost');
       await Post.findOneAndUpdate({
        _id: req.params.id 
       },{
        time: req.body.time,
        day: req.body.day,
        location: req.body.location,
      },);
      console.log("Update the time, day or location ");
      res.redirect(`/post/${req.params.id}`);
  } catch (err) {
    console.log(err, 'Sorry something went wrong');
  }
},


  deletePost: async (req, res) => {
    try {
      // Find post by id
      let post = await Post.findById({ _id: req.params.id });
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(post.cloudinaryId);
      // Delete post from db
      await Post.remove({ _id: req.params.id });
      console.log("Deleted Post");
      res.redirect("/profile");
    } catch (err) {
      res.redirect("/profile");
    }
  },
};
