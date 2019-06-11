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
	role:		{ required: true, enum: ["admin", "instructor", "student"] }
};
exports.UserSchema = UserSchema;

/*
 * Possible roles
 */
const RoleSchema = [
	"admin",
	"instructor",
	"student"
];
exports.RoleSchema = RoleSchema;

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
			// .project(projection)
			.project({ _id: 0, })
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
 * Get user info by email
 */
exports.getUserByEmail = async function (email, includePassword) {
	try {
		const db = getDBReference();
		const collection = db.collection('users');
		const projection = includePassword ? {} : { password: 0 };
		const results = await collection
			.find({ email: email })
			// .project(projection)
			.project({ _id: 0, })
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

		// Verify email is unique
		const tmp = await collection.find({ email: userToInsert.email }).toArray();
		const emailExists = !!tmp[0];

		if (emailExists) {
			console.log("Email already exists");
			return Promise.reject(403);
		} else {
			const passwordHash = await bcrypt.hash(userToInsert.password, 8);
			userToInsert.password = passwordHash;
			const count = await collection.countDocuments();
			userToInsert.id = count;
			const result = await collection.insertOne(userToInsert);
			return Promise.resolve( userToInsert.id );
		}
	} catch {
		return Promise.reject(500);
	}
};







