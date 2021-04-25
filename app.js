//jshint esversion:6
require('dotenv').config();
const PDFDocument = require('pdfkit');
var flash = require('req-flash');
const cors = require('cors');
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const http = require('http');
const https = require('https');
const qs = require('querystring')
var fs = require('fs');
var path = require('path');
const app = express();
var expressValidator = require('express-validator');
var fileUpload = require('express-fileupload');
var cookieParser = require('cookie-parser');
const axios = require('axios');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json());
app.use(express.static("public"));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: true
}));
app.use(flash());

//passport config
// require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://admin:admin@cluster0.dbo9h.mongodb.net/PrachisPiano", {
  useNewUrlParser: true
});

mongoose.set("useCreateIndex", true);
mongoose.set('useUnifiedTopology', true);

//cookie-parser
app.use(cookieParser())

//express fileupload middleware
app.use(fileUpload());
//express messages
app.use(require('connect-flash')());

const songSchema = new mongoose.Schema({
  title: String,
  youTubeId: String,
  moviename: String,
  genre: String,
  originalsinger: String,
  notes: String,
  notes_file: String,
  creation_date: {
    type: Date,
    default: Date.now
  },
});
const Song = new mongoose.model("Song", songSchema);
console.log("process key"+process.env.KEY);
var key = process.env.KEY;
const url = "https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=PLzbDe7pUoNqdX893apJ1MYDooNdDXiGrF&key="+key+"&maxResults=50"
const urldetail = "https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=PLzbDe7pUoNqdX893apJ1MYDooNdDXiGrF&key="+key+"&maxResults=10"
app.get("/", function(req, res) {
  var videoid = [];
  axios.get(url).then(response => {
    for (var i in response.data.items) {
      var item = response.data.items[i];
      if (item.snippet.title.includes('piano') || item.snippet.title.includes('Piano') || item.snippet.title.includes('Keyboard') || item.snippet.title.includes('keyboard')) {
        videoid.push(item);
      }
    }

    console.log("Flash message: " + req.flash('PostSuccessMsg'));
    res.render("home", {
      items: videoid,
      PostSuccessMsg: req.flash('PostSuccessMsg'),
      PostErrorMsg: req.flash('PostErrorMsg')
    });
  })
});

app.get("/allvideos", function(req, res) {
  var videoid = [];
  axios.get(urldetail).then(response => {
    for (var i in response.data.items) {
      var item = response.data.items[i];
      if (item.snippet.title.includes('piano') || item.snippet.title.includes('Piano') || item.snippet.title.includes('Keyboard') || item.snippet.title.includes('keyboard')) {
        videoid.push(item);
      }
    }
    res.render("allvideos", {
      items: videoid,
      nextpage: response.data.nextPageToken,
      previouspage: response.data.prevPageToken,
    });
  })
});

app.get("/allvideo/:id", function(req, res) {
  console.log(req.params.id);
  var videoid = []
  var urlnextpage = "https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=PLzbDe7pUoNqdX893apJ1MYDooNdDXiGrF&key="+key+"&maxResults=10&pageToken=" + req.params.id;
  axios.get(urlnextpage).then(response => {
    for (var i in response.data.items) {
      var item = response.data.items[i];
      if (item.snippet.title.includes('piano') || item.snippet.title.includes('Piano') || item.snippet.title.includes('Keyboard') || item.snippet.title.includes('keyboard')) {
        videoid.push(item);
      }
    }
    res.render("allvideos", {
      items: videoid,
      nextpage: response.data.nextPageToken,
      previouspage: response.data.prevPageToken,
    });
  })
});



app.get("/videodetail/:id", (req, res) => {
    console.log("Song Id:"+req.params.id);
  var videoid = [];
  var songid;
  axios.get(url).then(response => {
    for (var i in response.data.items) {
      var item = response.data.items[i];
      if (item.snippet.title.includes('piano') || item.snippet.title.includes('Piano') || item.snippet.title.includes('Keyboard') || item.snippet.title.includes('keyboard')) {
        videoid.push(item);
      }
      console.log("Item: "+item.id);
      if (item.id == req.params.id) {
        songid = item.snippet.resourceId.videoId;
        Song.findOne({
          youTubeId: item.id
        }, function(err, song) {
          if (err) {
            console.log("err in getting Requested Notes" + err);
          } else {
            console.log("Request ID: " + videoid);
            res.render('videodetail', {
              items: videoid,
              requestedvideo: songid,
              song: song,
            });
          }
        });
      }
    }
  })

})

app.post('/subscribe', (req, res) => {
  var email = req.body.subscriberemail;
  console.log(email);
  const data = {
    members: [{
      email_address: email,
      status: "subscribed",
      update_existing: true,
    }]
  }
  const url = "https://us7.api.mailchimp.com/3.0/lists/133771a7ca";
  const jsonData = JSON.stringify(data);
  const options = {
    method: "POST",
    auth: "Prachi's Piano:c5813d9a392d56e02db5713bdf1be438-us7",
  }

  // c5813d9a392d56e02db5713bdf1be438-us7

  // 133771a7ca

  const request = https.request(url, options, function(response) {
    console.log('STATUS: ' + response.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    if (response.statusCode === 200) {
      // res.send("Subscribed Successfully");
      console.log("Succesfully Subscribed");
      req.flash('PostSuccessMsg', 'Woah! Subscribed successfully!');
      res.redirect("/")
    } else {
      console.log("Error in Subscription");
      req.flash('PostErrorMsg', 'Oops! Something went wrong while Subscribing. Try Again.');
      res.redirect('/');
    }
    response.on("data", function(data) {
      // console.log(JSON.parse(data));
    })
  });

  request.write(jsonData);
  request.end();

})

app.get("/admin", function(req, res) {
  var videoid = [];
  const adminurl = "https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=PLzbDe7pUoNqdX893apJ1MYDooNdDXiGrF&key="+key+"&maxResults=50"
  axios.get(adminurl).then(response => {
    for (var i in response.data.items) {
      var item = response.data.items[i];
      if (item.snippet.title.includes('piano') || item.snippet.title.includes('Piano') || item.snippet.title.includes('Keyboard') || item.snippet.title.includes('keyboard')) {
        videoid.push(item);
      }
    }
    res.render("admin", {
      items: videoid,
    });
  })
})



app.post("/admin/addsong/", function(req, res){
  var doc = new PDFDocument({ layout : 'portrait', margins: { top: 50, bottom: 50, left: 72, right: 72 }, info: {
     Title 	: req.body.title,
     Author 	: "Prachi's Piano",
     Subject 	: "Notes for the Song"+req.body.title,
  }});
  doc.pipe(fs.createWriteStream('pdfs/' + req.body.youTubeId + '.pdf'));
  doc.image(path.join(__dirname, '/public/img/prachi-logo.png'), 5, 0);
doc.image('D:/projects/webdevelopment/PrachiPiano/public/img/piano-home.png', 0, 0, {align: 'center', valign: 'center'});

doc.fontSize(20).text("Welcome to Prachi's Piano...", 100, 120, {
  width: 412,
  align: 'center'});

doc.fontSize(16).text('Song Title: Song Name', 100, 150)
  .font('Times-Roman', 14)
  .moveDown()
  .text("Movie/Album: "+req.body.moviename)
  .text("Singer: "+req.body.originalsinger)
  .moveDown()
  .text(req.body.notes, {
    width: 412,
    align: 'justify',
    indent: 0,
    columns: 1,
    ellipsis: true,
    lineGap: 10,
  });
  doc.end();
  console.log("Received ID: " + req.body.youTubeId);
  var song = new Song({
    title: req.body.title,
    moviename: req.body.moviename,
    genre: req.body.genre,
    originalsinger: req.body.originalsinger,
    youTubeId: req.body.youTubeId,
    notes: req.body.notes,
    creation_date: Date.now(),
    notes_file: 'pdfs/' + req.body.youTubeId + '.pdf',

  })
  song.save(function(err) {
    if (err) return console.log(err);
    else {
      res.redirect('/admin');
    }
  })
});

app.get('/download/:id',function(req,res){
  console.log(req.params.id);
    res.download(__dirname +'/pdfs/'+req.params.id+'.pdf','notes.pdf');
})


app.listen(process.env.PORT || 3003, function() {
  console.log("Server Started Successfully");
});
