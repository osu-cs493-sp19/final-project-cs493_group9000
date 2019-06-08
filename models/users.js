const { getDBReference } = require('../lib/mongo');
const { ObjectId } = require('mongodb');
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
 * Get all user info
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
	const db = getDBReference();
	const collection = db.collection('users');
	if (!ObjectId.isValid(id)) {
		console.log("Is not valid");
		return null;
	} else {
		const projection = includePassword ? {} : { password: 0 };
		const results = await collection
			.find({ _id: new ObjectId(id) })
			.project(projection)
			.toArray();
		return results[0];
	}
}

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Insert a new User into the DB.
 */
exports.insertNewUser = async function (user) {
	try {
		const userToInsert = extractValidFields(user, UserSchema);
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
