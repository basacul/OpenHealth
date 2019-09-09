const express = require('express');
const mongoose = require('mongoose');
const router = express.Router(); // now instead of app, use router
const middleware = require('../middleware');
const hlf = require('../utils/hyperledger');
const Mana = require('../models/mana');
const File = require('../models/file');
const User = require('../models/user');
const winston = require('../config/winston');
const aws = require('../utils/aws');
const download = require('../config/download');
/**
* E-Record Home 
*/
router.get('/', middleware.isLoggedIn, (req, res) => {
	let items;
	let associations;
	let userHLF
	
	Mana.findOne({user: req.user._id}, (error, mana) => {
		if(error){
			winston.error(error.message);
			req.flash('error', 'Mana Id not found.');
			res.redirect('/home');
		}else{
			hlf.getById(hlf.namespaces.user, mana._id.toString()).then(responseUser => {
				userHLF = responseUser.data;
				console.log(userHLF.role);
				return hlf.selectItemByRole(userHLF.role);
			}).then(responseItems => {
				items = responseItems.data;
				console.log(`MANA ID : ${mana._id}`)
				return hlf.selectConcernedAssociation(mana._id.toString());
			}).then(responseAssociations => {
				associations = responseAssociations.data;
			}).catch(error => {
				winston.error(error.message);
				req.flash('error', 'Could not retrieve data');
			}).finally(() => {
				res.render("app/e-record/e-record", {items: items, associations: associations, manaId: mana._id.toString()});
			});
		}
	});
});

/**
* Association Home
*/
router.get('/association', middleware.isLoggedIn, (req, res) => {
	let associations;
	let users;
	let items;
	let manaId;
	
	Mana.findOne({user: req.user._id}, (error, mana) => {
		if(error){
			winston.error(error.message);
			req.flash('error', error.message);
			res.redirect('back');
		}else{
			
			hlf.selectConcernedAssociation(mana._id.toString()).then(responseAssociation => {
				associations = responseAssociation.data;
				return hlf.getAll(hlf.namespaces.user);
			}).then(responseUsers => {
				users = responseUsers.data;
				// TODO: filter out the current user
				let userRole;
				console.log("===================================");
				console.log(users);
				console.log("===================================");
				users = users.filter(user => {
					if(user.manaId == `${mana._id}`){
						userRole = user.role;
					}else{
						return user;
					}
				});
				console.log(users.length);
				return hlf.selectOwnedItem(userRole);
			}).then(responseItems => {
				items = responseItems.data;
			}).catch(error => {
				winston.error(error.message);
				req.flash('error', error.message);
			}).finally(() => {
				res.render("app/e-record/association", {associations: associations, items: items, users: users, manaId: mana._id.toString()});
			});
		}
	});
	
});

/**
* Create new Association through transaction
*/
router.post('/association', middleware.isLoggedIn,(req, res) => {

		if(!req.body.association.from){
			winston.error("No manaId given for posting a new association");
			req.flash('error', "ManaId is missing on association.ejs");
			res.redirect('back');
		}else{
			hlf.createAssociation(req.body.association).then(responseAssociation => {
				req.flash('success', 'Association created on HLF');
			}).catch(error => {
				winston.error(error.message);
				req.flash('error', 'Association not on HLF');
			}).finally(() => {
				res.redirect('back')
			});
		}
});

/**
* Association Detail Page
*/
router.get('/association/:associationId', middleware.isLoggedIn, (req, res) => {
	let association;
	let users;
	let items;
	let manaId;
	let files;
	
	Mana.findOne({user: req.user._id}, (error, mana) => {
		if(error){
			winston.error(error.message);
			req.flash('error', error.message);
			res.redirect('back');
		}else{
			User.findById(req.user._id).populate('files').exec(function (err, data) {
				if (err) {
					winston.error(err.message);
					res.redirect('back');
				} else {
					hlf.getAssociationById(req.params.associationId).then(responseAssociation => {
						association = responseAssociation.data;
						return hlf.getAll(hlf.namespaces.user);
					}).then(responseUsers => {
						users = responseUsers.data;

						// TODO: filter out the current user
						users = users.filter(user => user.manaId != `${mana._id}`);
						return hlf.selectOwnedItem(mana._id.toString());
					}).then(responseItems => {
						items = responseItems.data;
					}).catch(error => {
						winston.error(error.message);
					}).finally(() => {
						res.render("app/e-record/association_show", {association: association[0], items: items, users: users, manaId: mana._id.toString(), files: data.files});
					});
				}
			});
			
		}
	})
});

/**
* Send message for respective Association
*/
router.put('/association/:associationId', middleware.isLoggedIn, (req,res) => {

	hlf.sendMessageAssociation(req.params.associationId, req.body.message, req.body.manaId).then(responseAssociation => {
		winston.info('Message sent for respective Association');
		req.flash('success', 'Message successfully sent');
	}).catch(error => {
		winston.error(error.message);
		req.flash('error', 'Message NOT sent!');
	}).finally(()=>{
		res.redirect('back');
	});
});

router.delete('/association/:associationId', middleware.isLoggedIn, (req, res) => {
	hlf.deleteAssociation(req.params.associationId, req.user._id);
	res.redirect('/association');
});

/**
* Download file for approved association only
*/
router.post('/association/:associationId/download', middleware.isLoggedIn, middleware.checkIfAuthorized, (req, res) => {
	// request includes req.filePath in order to retrieve the respective file added in middleware.checkIfAuthorized
	
	const downloadObject = aws.s3.getObject(aws.paramsDownload(req.filePath)).createReadStream(); 
	const filename = req.filePath.split('/')[1];
	
	// in order to download the file. otherwise file is displayed in the browser
	// TODO: Check if pdf, jpeg or any form that can be displayed and downloaded form browser
	// 		 otherwise direct download by adding res.attachement(filename)
	res.attachment(filename);
	downloadObject.on('error', err => {
		winston.error(err.message);
		req.flash('error', 'File could not be downloaded from amazon aws S3');
		res.redirect('back');
	}).pipe(res);
	
});	

/**
* Grant association
*/
router.put('/association/:associationId/grant', middleware.isLoggedIn, (req, res) => {
	// 1. Retrieve file
	const fileId = mongoose.Types.ObjectId(req.body.association.fileId);
	File.findById(fileId, (error, file) => {
		if(error){
			winston.error(error.message);
			req.flash('error', 'File not found to update');
			res.redirect('back');
		}else{
			// 2. Update authorized with new manaId in 
			console.log(req.body.association);
			const manaId = mongoose.Types.ObjectId(req.body.association.from);
			if(!file.authorized.includes(manaId)){
				console.log(`Pushing ${manaId} to authorized list`);
				file.authorized.push(manaId);
			}
			
			file.save();
			
			const link = `${download.url}/${file._id}`;
			
			// grant association on hlf
			hlf.grantAssociation(req.params.associationId, req.body.association.message, req.body.manaId, link).then(responseGrant => {
				console.log(responseGrant.data);
				req.flash('success', 'Association granted.')
			}).catch(error => {
				winston.error(error.message);
				req.flash('error', 'Association granting unsuccessful');
			}).finally(() => {
				res.redirect('back')
			});
		}
	});
});

/**
* Download file for approved association only
*/
router.put('/association/:associationId/revoke', middleware.isLoggedIn, (req, res) => {
	// 1. Retrieve file
	const fileId = mongoose.Types.ObjectId(req.body.association.fileId);
	File.findById(fileId, (error, file) => {
		if(error){
			winston.error(error.message);
			req.flash('error', 'File not found to update');
			res.redirect('back');
		}else{
			file.authorized.pull(mongoose.Types.ObjectId(req.body.association.fileId));
			file.save();
			
			hlf.revokeAssociation(req.params.associationId, req.body.association.message, req.body.manaId).then(responseRevoke => {
				winston.info('Association access revoked.');
				req.flash('success', 'Successfully updated hlf.');
			}).catch(error => {
				winston.error(error.message);
				req.flash('error', 'Could not perform revoke on hlf');
			}).finally(() => {
				res.redirect('back');
			})
		}
	});
});	

/**
* Item Home Page
*/
router.get('/item', middleware.isLoggedIn, (req, res) => {
	let items;
	let users;
	Mana.findOne({user: req.user._id}, (error, mana) => {
		if(error){
			winston.error(error.message);
			req.flash('error', 'Could not find ManaId');
			res.redirect('/home');
		}else{
			hlf.getById(hlf.namespaces.user, mana._id.toString()).then(responseUser => {
				return hlf.selectOwnedItem(responseUser.data.role);
			}).then(itemData => {
				items = itemData;
				return hlf.getAll(hlf.namespaces.user);
			}).then(userData => {
				users = userData;
			}).catch(error => {
				winston.error(error.message);
				req.flash('error', 'Item: went wrong.');
			}).finally(() => {
				res.render("app/e-record/item", {items: items, users: users});
			});
			
			
		}
	})
	
})





module.exports = router;