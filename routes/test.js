const express = require('express');
const mongoose = require('mongoose');
const router = express.Router(); // now instead of app, use router
const middleware = require('../middleware');
const User = require('../models/user');
const Test = require('../models/test');
const Question = require('../models/question');
const Exam = require('../models/exam');
const winston = require('../config/winston');

/* INDEX TEST
	displays all available tests */
router.get('/', middleware.isLoggedIn, (req, res) => {
	let test = []; 
	let exams = [];
	
	Test.find({},  function(error, tests) {
		if(error){
			winston.error("Something went wrong when requesting test");
			req.flash('error', 'Could not retrieve tests.');
		}else{
			test = tests;
			User.findById(req.user._id).populate('exams').exec(function(err, foundUser){
				if(err){
					inston.error("Something went wrong when requesting user");
					req.flash('error', 'Could not retrieve user.');
				}else{
					exams = foundUser.exams;
					res.render("app/test/test", {tests: tests, exams: exams});
				}
			});
		}
		
	});
});

/* CREATE NEW TEST
create new test and show new test form*/
router.post('/', middleware.isLoggedIn, (req, res) =>{
	
	if (!req.body.topic) {
        const errorBody = new Error('Provide a topic.'); 
		winston.error(errorBody.message);
		req.flash('error', errorBody.message);
    } else {
		Test.create(req.body, function(err, newTest){
			if(err){
				winston.error(err.message);
				req.flash(err.message);
			}else{
				newTest.topic = req.body.topic;
				newTest.number = 0;
				newTest.description = req.body.description;
				newTest.save();
				req.flash('success', `Congrats. New test ${req.body.topic.toUpperCase()} created.`);
			}
		});
		
	}		
	res.redirect('/tests');
		
		
	
});

/* SHOW TEST
displays the test and all its question. Furthermore modal form included to add questions */
router.get('/:id', middleware.isLoggedIn, function(req, res){
	// need to populate questions array and execute due to lazy loading
	Test.findById(req.params.id).populate('questions').exec(function (err, foundTest){
		if(err){
			winston.error(err.message);
			req.flash('error', err.message);
			res.redirect('back');
		}else if(!foundTest){
			const msg = "Test does not exist";
			winston.error(msg);
			req.flash('error', msg);
			res.redirect('back');
		}else{
			res.render('app/test/test_show', {test: foundTest});
		}
	});
});

/* PUT TEST
development will implement for questions  
1. Add
2. Remove
3. Update
*/
router.put('/:id', middleware.isLoggedIn, function(req, res){
	Question.create(req.body, function(err, newQuestion){
		if(err){
			winston.error(err.message);
			req.flash(err.message);
		}else{
			newQuestion.question = req.body.question;
			newQuestion.field = req.body.field;
			newQuestion.answers = [
				{id: 0, answer: req.body.answer1}, 
				{id: 1, answer: req.body.answer2}, 
				{id: 2, answer: req.body.answer3}, 
				{id: 3, answer: req.body.answer4}
			];
			newQuestion.solution = req.body.solution;
			Test.findById(req.params.id, function(errTest, foundTest){
				if(errTest){
					winston.error(err.message);
					req.flash('error', err.message);
					res.redirect('/');
				}else{
					if(foundTest){
						newQuestion.save();
						foundTest.number = foundTest.number + 1;
						/* console.log(newQuestion);
						console.log(foundTest.questions); */
						foundTest.questions.push(newQuestion);
						foundTest.save();
						req.flash('success', `Question created and added.`);
					}else{
						winston.error('Test NOT found to push question to questions array.');
						req.flash('error', 'Test not found to push question!');
					}
				}
			});
		}
	});
	
	res.redirect(`/tests/${req.params.id}`);
});

/* POST EXAM
when the exam is performed the form will be handled here 
need to change this as this is not restful */
router.post('/:id', middleware.isLoggedIn, function(req, res){
	let corrects = 0;
	let answers = [];
	let exam_id;
	
	for (let key in req.body.solutions) {
		const question_id = mongoose.Types.ObjectId(key);
		let correct = false;
		
		if( req.body.solutions[key] == req.body.answers[key]){
			corrects += 1;
			correct = true;
		}
		
		answers.push({
			id: question_id,
			answered: req.body.answers[key],
			correct: correct
		});
	}
	
	Exam.create(req.body, function(err, newExam){
		if(err){
			winston.error(err.message);
			req.flash(err.message);
			res.redirect('/tests');
		}else{
			exam_id = newExam._id;
			newExam.correct = corrects;
			newExam.answers = answers;
			newExam.test = mongoose.Types.ObjectId(req.params.id);
			
			User.findById(req.user._id, function(errUser, foundUser){
				if(errUser){
					winston.error(errUser.message);
					req.flash('error', errUser.message);
					res.redirect('/tests');
				}else{
					newExam.save();
					foundUser.exams.push(newExam);
					foundUser.save();
				}
			});
			
			req.flash('success', `Congrats. New exam created.`);
			res.redirect(`/tests/exams/${exam_id}`);
		}
	});

});

/* SHOW EXAM RESULTS
displays the results of a given exam */
router.get('/exams/:id', middleware.isLoggedIn, function(req, res){
	let results = [];
	Exam.findById(req.params.id, function(errExam, foundExam){
		if(errExam){
			winston.error(errExam.message);
			req.flash('error', errExam.message);
			res.redirect('back');
		}else{
			Test.findById(foundExam.test).populate('questions').exec(function(errTest, foundTest){
				if(errTest){
					winston.error(errTest.message);
					req.flash('error', errTest.message);
					res.redirect('back');
				}else{
					req.flash('success', 'All exam answers and the test retrieved.')
					res.render("app/test/exam_show", {test: foundTest, exam: foundExam});
				}
			});
		}
	});

});


module.exports = router;