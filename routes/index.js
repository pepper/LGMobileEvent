var express = require('express');
var router = express.Router();
var mongo = require("../utilities/database");
var ObjectID = require('mongodb').ObjectID;

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.post("/photo", function(req, res){
	console.log(req.body);
	mongo.database.collection("photo", function(err, collection){
		if(err){
			return console.log(err);
		}
		collection.insert([{
			"facebook_id": req.body.facebook_id,
			"base64_data": req.body.photo,
			"datetime": new Date()
		}], function(err, data){
			if(err){
				return console.log(err);
			}
			res.json(data[0]);
		});
	});
});

router.get("/photo", function(req, res){
	mongo.database.collection("photo", function(err, collection){
		collection.find({}, {
			"_id": 1,
			"datetime": 1
		}).sort({ "datetime": -1 }).toArray(function(err, photos){
			res.json(photos);
		});;
	});
});

router.get("/photo/:photo_id", function(req, res){
	mongo.database.collection("photo", function(err, collection){
		if(err){
			return console.log(err);
		}
		collection.find({_id: new ObjectID(req.params.photo_id)}).toArray(function(err, photos){
			if(err){
				return console.log(err);
			}
			res.json(photos[0]);
		});
	});
});

router.get("/photo/:photo_id/url", function(req, res){
	mongo.database.collection("photo", function(err, collection){
		if(err){
			return console.log(err);
		}
		collection.find({_id: new ObjectID(req.params.photo_id)}).toArray(function(err, photos){
			if(err){
				return console.log(err);
			}
			var matches = photos[0].base64_data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
			var response = {};
			if(matches.length !== 3){
				return console.log("Invalid input string");
			}
			response.type = matches[1];
			response.data = new Buffer(matches[2], "base64");
			res.contentType(response.type);
			res.end(response.data, "binary");
		});
	});
});

module.exports = router;
