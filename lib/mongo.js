/*
 * Module for working with a MongoDB connection.
 */

const { MongoClient } = require('mongodb');

// const mongoHost     = process.env.MONGO_HOST;
// const mongoPort     = process.env.MONGO_PORT || 27017;
// const mongoUser     = process.env.MONGO_USER;
// const mongoPassword = process.env.MONGO_PASSWORD;
// const mongoDBName   = process.env.MONGO_DB_NAME;

const mongoHost     = "mongodb";
const mongoPort     = 27017;
// const mongoUser     = "basic_user";
const mongoUser     = "root";
const mongoPassword = "hunter2";
const mongoDBName   = "admin";

const mongoUrl = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDBName}`;

let db = null;



exports.connectToDB = function (callback) {
	console.log("mongoUrl:", mongoUrl);

	var connectWithRetry = function() {
		MongoClient.connect(mongoUrl, { useNewUrlParser: true }, (err, client) => {
			if (err) {
				console.log("Failed to connect");
				setTimeout(connectWithRetry, 5000);
			} else {
				db = client.db(mongoDBName);
			}
		});
	}

	connectWithRetry();
	callback();
};


exports.getDBReference = function () {
	return db;
};


