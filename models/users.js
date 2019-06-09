const { getDBReference } = require('../lib/mongo');
const { ObjectId } = require('mongodb');
const { extractValidFields } = require('../lib/validation');
const bcrypt = require('bcryptjs');

/*
 * Schema for a User.
 */
const UserSchema = {
	name:		{ required: true },
	email:		{ required: true },
	password:	{ required: true },
	role:		{ required: true }
};
exports.UserSchema = UserSchema;


// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Get all users
 */
exports.getUsers = async function () {
	try {
		const db = getDBReference();
		const collection = db.collection('users');
		const results = await collection.find().toArray();
		return Promise.resolve(results);
	} catch {
		return Promise.reject(500);
	}
}

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Get user info by ID
 */
exports.getUserByID = async function (userID, includePassword) {
	try {
		const db = getDBReference();
		const collection = db.collection('users');
		const projection = includePassword ? {} : { password: 0 };
		const results = await collection
			.find({ id: userID })
			.project(projection)
			.toArray();
		if (results[0]) {
			return Promise.resolve(results[0]);
		} else {
			return Promise.reject(404);
		}
	} catch {
		return Promise.reject(500);
	}
}

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Insert a new User into the DB.
 */
exports.insertNewUser = async function (user) {
	try {
		let userToInsert = extractValidFields(user, UserSchema);
		const db = getDBReference();
		const collection = db.collection('users');
		const passwordHash = await bcrypt.hash(userToInsert.password, 8);
		userToInsert.password = passwordHash;
		const count = await collection.countDocuments();
		userToInsert.id = count;
		const result = await collection.insertOne(userToInsert);
		return Promise.resolve( {"insertedId": result.insertedId, "id": userToInsert.id} );
	} catch {
		return Promise.reject(500);
	}
};
