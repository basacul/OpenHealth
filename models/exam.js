const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
	correct: Number,
	/* TODO: generate a model Answer referencing to the question */
	answers: [{
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Question"
		},
		answered: Number,
		correct: Boolean
	}],
	test: 
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Test"
		}
	
});

module.exports = mongoose.model("Exam", examSchema);