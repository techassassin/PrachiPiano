var express = require('express');
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema
// mongoose.connect("mongodb+srv://<username>:<password>@cluster0-owf5m.mongodb.net/cmscart?retryWrites=true&w=majority",{ useUnifiedTopology: true, useNewUrlParser: true  })

mongoose.connect("mongodb+srv://admin:admin@cluster0.dbo9h.mongodb.net/PostsDB", {
  useNewUrlParser: true
});
// Product schema
const Blogschema = new Schema({
  author: {
    type: String,
    required: true,
  },
  creationtime:{
    type: Date,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  desc: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,

  },

});
Blogschema.plugin(mongoosePaginate);
module.exports = Blogschema;

// var Page=mongoose.exports=mongoose.model('Page',PageSchema);
