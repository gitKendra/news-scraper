var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var NoteSchema = new Schema({
  body: {
  	type: String
  }
});

// NoteSchema.pre('remove', function(next) {
//     Article.update(
//         { submission_ids : this._id}, 
//         { $pull: { submission_ids: this._id } },
//         { multi: true })  //if reference exists in multiple documents 
//     .exec();
//     next();
// });


var Note = mongoose.model("Note", NoteSchema);

module.exports = Note;
