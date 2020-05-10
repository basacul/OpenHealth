const util = require('util');
const config = require('../config/corona-config');
const https = require('https');

let corona = {};

corona.getData = function getData(){
	
  var str = '';

  var options = {
        host: config.hostname,
        path: '/api'
  };

  callback = function(response) {

	response.on('data', function (chunk) {
		str += chunk;
	});

	response.on('end', function () {
		console.log(req.data);
		console.log(str);
		// your code here if you want to use the results !
	});
  }

  var req = https.request(options, callback).end();

  // These just return undefined and empty
  // console.log(req.data);
  // console.log(str);
}


module.exports = corona;