const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
	question: String,
	/* usually four questions with radio button */
	answers: [{
		id: Number,
		answer: String
	}],
	/* the solution among the four answers */
	solution: Number,
	field: String //what kind of medical field
	
});

module.exports = mongoose.model("Question", questionSchema);