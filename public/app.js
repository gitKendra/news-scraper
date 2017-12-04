$(document).ready(function(){
$("#srape-new").on("click", function(){
  $.ajax({
    method: "GET",
    url: "/scrape"
  })
    .done(function(data){
      location.reload();
      alert("Added " + data.length + " articles!");
    });
});

// Add article to Saved Articles
$(document).on("click", ".save-btn, .del-btn", function(){
  var articleId = $(this).data("id");
  var bool = $(this).data("bool");
console.log(bool);
  $.ajax({
    method: "PUT",
    url: "/articles/" + articleId + "/" + bool
  })
  .done(function(data){
    console.log(data);
    location.reload();
    if(data.saved){
      alert("Successfully added the article.");
    }
    else{
      alert("Successfully removed the article.")
    }
  })
})

// When user clicks on Article Notes button, show modal
$('#notesModal').on('show.bs.modal', function (event) {
    var modal = $(this);
    var button = $(event.relatedTarget);
    var articleId =  button.data("id");
    var noteList ="";
  // Get all notes associated with the id
  $.getJSON("/article/" + articleId, function(data){

    console.log(data);
    console.log("note body" );
    console.log(data.note);
    // Clear out any existing notes from prior event
    $("#notes-list").empty();

    // Add notes to modal
    if(data.note == undefined){
      $("#notes-list").html("<li>No notes.</li>");
    }
    else{
      $("#notes-list").append("<li>" + data.note.body +"</li>");
    }

    // update modal contents with current notes
    modal.find('#savenote').val(data._id);

  });
});

$(document).on("click", "#savenote", function(){
  // Grab the id associated with the article from the submit button
  var articleId = $(this).val();

  if($("#noteinput").val() != null){
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/article/" + articleId,
      data: {
        // Value taken from note textarea
        body: $("#noteinput").val()
      }
    })
      .done(function(data) {
        // Log the response
        console.log(data);
        // TODO: update modal with note
        $('#notesModal').modal('show');
      });
  }
  // Also, remove the values entered in the input and textarea for note entry
  $("#noteinput").val("");

});


// // Whenever someone clicks a p tag
// $(document).on("click", ".card-header", function() {
//   // Empty the notes from the note section
//   $("#notes").empty();
//   // Save the id from the p tag
//   var thisId = $(this).attr("data-id");

//   // Now make an ajax call for the Article
//   $.ajax({
//     method: "GET",
//     url: "/articles/" + thisId
//   })
//     // With that done, add the note information to the page
//     .done(function(data) {
//       console.log(data);
//       // The title of the article
//       $("#notes").append("<h2>" + data.title + "</h2>");
//       // An input to enter a new title
//       $("#notes").append("<input id='titleinput' name='title' >");
//       // A textarea to add a new note body
//       $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
//       // A button to submit a new note, with the id of the article saved to it
//       $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

//       // If there's a note in the article
//       if (data.note) {
//         // Place the title of the note in the title input
//         $("#titleinput").val(data.note.title);
//         // Place the body of the note in the body textarea
//         $("#bodyinput").val(data.note.body);
//       }
//     });
// });

// // When you click the savenote button
// $(document).on("click", "#savenote", function() {
//   // Grab the id associated with the article from the submit button
//   var thisId = $(this).attr("data-id");

//   // Run a POST request to change the note, using what's entered in the inputs
//   $.ajax({
//     method: "POST",
//     url: "/articles/" + thisId,
//     data: {
//       // Value taken from title input
//       title: $("#titleinput").val(),
//       // Value taken from note textarea
//       body: $("#bodyinput").val()
//     }
//   })
//     // With that done
//     .done(function(data) {
//       // Log the response
//       console.log(data);
//       // Empty the notes section
//       $("#notes").empty();
//     });

//   // Also, remove the values entered in the input and textarea for note entry
//   $("#titleinput").val("");
//   $("#bodyinput").val("");
// });
})