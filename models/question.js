const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
	creationDate: Date,
	// TODO: resolve image path
	img: String, // for now an url to the image
	question: String,
	/* usually four questions with radio button */
	answers: [{
		id: Number,
		answer: String
	}],
	/* the solution among the four answers */
	solution: Number,
	field: String, //what kind of medical field
	explanation: String,
	type: String, // type of question
});

module.exports = mongoose.model("Question", questionSchema);