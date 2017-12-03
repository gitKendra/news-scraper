// MONGODB_URI: mongodb://heroku_8zwdl929:9ab3d2g5jp6pvhtlcqgjio418k@ds119486.mlab.com:19486/heroku_8zwdl929
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var request = require("request");

// Our scraping tools
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

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
mongoose.connect("mongodb://localhost/scraper", {
  useMongoClient: true
});

// Routes

// // Serve index.handlebars to the root route.
// app.get("/", function(req, res) {
//   db.Article.find({}).then(function(dbArticles){
//     res.render("index", dbArticles);
//   })
//     res.render("index", null);
//   }
// });


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
      console.log("RENDER Index");
      console.log(dbArticle);
      // If we were able to successfully find Articles, send them back to the client
      res.render("index", {article: dbArticle});
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// // Route for getting all Articles from the db
// app.get("/articles", function(req, res) {
//   // Grab every document in the Articles collection
//   db.Article
//     .find({})
//     .then(function(dbArticle) {
//       // If we were able to successfully find Articles, send them back to the client
//       res.json(dbArticle);
//     })
//     .catch(function(err) {
//       // If an error occurred, send it to the client
//       res.json(err);
//     });
// });

// // Route for grabbing a specific Article by id, populate it with it's note
// app.get("/articles/:id", function(req, res) {
//   // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
//   db.Article
//     .findOne({ _id: req.params.id })
//     // ..and populate all of the notes associated with it
//     .populate("note")
//     .then(function(dbArticle) {
//       // If we were able to successfully find an Article with the given id, send it back to the client
//       res.json(dbArticle);
//     })
//     .catch(function(err) {
//       // If an error occurred, send it to the client
//       res.json(err);
//     });
// });

// // Route for saving/updating an Article's associated Note
// app.post("/articles/:id", function(req, res) {
//   // Create a new note and pass the req.body to the entry
//   db.Note
//     .create(req.body)
//     .then(function(dbNote) {
//       // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
//       // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
//       // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
//       return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
//     })
//     .then(function(dbArticle) {
//       // If we were able to successfully update an Article, send it back to the client
//       res.json(dbArticle);
//     })
//     .catch(function(err) {
//       // If an error occurred, send it to the client
//       res.json(err);
//     });
// });

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});