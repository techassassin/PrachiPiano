var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var mkdirp = require('resize-img');
var app = express();
var mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
var resizeImg = require('resize-img');
var Schema = require('../models/blog')
var Blog = mongoose.model("blog", Schema);
app.use(bodyParser.urlencoded({
  extended: true
}));

router.get('/', async function(req, res) {

  var count;
  await Blog.countDocuments(function(err, c) {
    count = c;
  })
  await Blog.find(function(err, items) {
    res.render('blogs', {
      items: items,
      count: count,
      msg: ""
    })
  })
});

router.post('/', async function(req, res) {
var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
var title = req.body.title;
var desc = req.body.desc;
var blog = new Blog({
  author: req.user.firstname,
  title: title,
  desc: desc,
  image: imageFile,
  creationtime: new Date().toLocaleDateString(),
})

await blog.save(function(err) {
  if (err) return console.log(err);
  else {

    fs.mkdirSync('public/blog_images/' + blog._id, function(err) {
      if (err)
        return console.log("error in first mkdirp " + err);
      else {
        console.log("dir created in first mkdir")
      }
    });
    if (imageFile != "") {
      var blogImage = req.files.image;

      var path = 'public/blog_images/' + blog._id + '/' + imageFile;
      blogImage.mv(path, function(err) {
        if (err) {
          return console.log("ERROR IN BLOG IMAGE MV" + err);
        } else {
          console.log("no error in blogImage mv");
        }
      });
    }
    req.flash('success', 'Blog added');
    res.redirect('/blog');
  }
});

}
);

//exports
module.exports=router;
