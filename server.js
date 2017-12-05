// MONGODB_URI: mongodb://heroku_8zwdl929:9ab3d2g5jp6pvhtlcqgjio418k@ds119486.mlab.com:19486/heroku_8zwdl929
//mongodb://localhost/scraper
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var request = require("request");

// Our scraping tools
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://heroku_8zwdl929:9ab3d2g5jp6pvhtlcqgjio418k@ds119486.mlab.com:19486/heroku_8zwdl929", {
  useMongoClient: true
});

// Routes

// A GET route for scraping the cnet.com website
app.get("/scrape", function(req, res) {
  var count = 0;

  // Grab the body of the html with request
  request("https://www.cnet.com/", function(error, response, html) {
    if (!error && response.statusCode == 200) {
      // Load html body into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(html);
      var results = [];
      // Grab every div with a class of item within a div class of latestScrollItems
      $("div.latestScrollItems div.item").each(function(i, element) {

        // Save an empty result object
        var result = {};

        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this).children("a").children("div").children("h3").text();
        result.body = $(this).children("a").children("div").children("p").text();
        result.link = "https://www.cnet.com" + $(this).children("a").attr("href");

        results.push(result);
        // console.log(result);
      });

      // Add articles to DB
        // Create a new Article using the `result` object built from scraping
         db.Article
          .create(results)
          .then(function(dbArticles) {
            console.log("Articles");
            res.send(dbArticles);
          })
          .catch(function(err) {
            // If an error occurred, send it to the client
            res.json(err);
          });
    } // end if

  }); // end request

}); // end scrape

// Route for getting all Articles from the db
app.get("/", function(req, res) {
  console.log("GET /");
  // Grab every document in the Articles collection
  db.Article
    .find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.render("index", {article: dbArticle});
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for getting all Saved Articles from the db
app.get("/saved", function(req,res){
  console.log("GET /saved");
  // Grab every document in the Articles collection
  db.Article
    .find({saved:true})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.render("saved", {article: dbArticle});
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
})

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/article/:id", function(req, res) {
  console.log("GET notes for " +req.params.id);

  // Find the article in DB
  db.Article
    .findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      console.log("FOUND the article: ");
      console.log(dbArticle);
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for updating an Article's saved status
app.put("/articles/:id/:bool", function(req, res) {
  console.log("PUT")

  db.Article
    .findOneAndUpdate({_id: req.params.id}, {saved: req.params.bool}, {new: true})
    .then(function(dbArticle) {
      console.log("Added article to saved");
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/article/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note
    .create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: {note: dbNote._id} }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.delete("/note/:nid/:aid", function(req, res){

  // // Delete the note from the Article 
  // db.Article
  //   .findOneAndUpdate({ _id:req.params.aid}, { "$pull": { "note": { _id:req.params.nid } }})
  //   .then(function(dbArticle){
  //     console.log("Removed note from Article");
      // Delete the note from Note
      db.Note  
        .findOneAndRemove({_id:req.params.nid})
        .then(function(data){
          console.log("Removed note");
          res.json(data);
        })
        .catch(function(err){
          res.json(err)
        })
    // });

})

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});