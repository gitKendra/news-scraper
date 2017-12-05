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

    // Add/remove article in Saved Articles
    $(document).on("click", ".save-btn, .del-btn", function(){
      var articleId = $(this).data("id");
      var bool = $(this).data("bool");

      $.ajax({
        method: "PUT",
        url: "/articles/" + articleId + "/" + bool
      })
      .done(function(data){
        console.log(data);
        // location.reload();

        if(data.saved){
          $("#save-alert").modal('show');
        }
        else{
          location.reload();
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
        if(data.note.length == 0){
          $("#notes-list").html("<li class='list-group-item'>No notes.</li>");
        }
        else{
          for (var i = 0; i < data.note.length; i++){
            var note = "<li class='list-group-item d-flex justify-content-between align-items-center'>"
                + data.note[i].body 
                + "<button class='btn btn-danger btn-sm del-note' data-id='" + data.note[i]._id + "' data-pid='" + articleId + "'>"
                + "&times;</button></li>";

            $("#notes-list").append(note);
          }
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
            $('#notesModal').modal('hide');

          });
      }
      // Also, remove the values entered in the input and textarea for note entry
      $("#noteinput").val("");

    });

    // Delete a not from the database
    $(document).on("click", ".del-note", function(){
        var noteId = $(this).data("id");
        var articleId = $(this).data("pid");

        $.ajax({
            method:"DELETE",
            url: "/note/" + noteId + "/" + articleId
        })
        .done(function(data){
             $('#notesModal').modal('hide');
        })

    })

})