const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
	topic: String,
	number: Number,
	description: String,
	questions: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Question"
		}
	]
});

module.exports = mongoose.model("Test", testSchema);