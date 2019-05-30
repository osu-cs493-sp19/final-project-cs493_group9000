/*
 * Auth stuff.
 */

 const { getDBReference }							= require('../lib/mongo');
const bcrypt = require('bcryptjs');


const jwt = require('jsonwebtoken');

const secretKey = 'SuperSecret!';



exports.generateAuthToken = function (userId) {
	const payload = {
		sub: userId
	};
	const token = jwt.sign(payload, secretKey, { expiresIn: '24h' });
	return token;
};


exports.requireAuthentication = function (req, res, next) {
	const authHeader = req.get('Authorization') || '';
	const authHeaderParts = authHeader.split(' ');
	const token = authHeaderParts[0] === 'Bearer' ? authHeaderParts[1] : null;

	try {
		const payload = jwt.verify(token, secretKey);
		req.token_user = payload.sub;
		next();
	} catch (err) {
		console.error("  -- error:", err);
		res.status(401).send({
			error: "Invalid authentication token provided."
		});
	}
};


async function isAdmin (userid) {
	try {
		const db = getDBReference();
		const collection = db.collection('users');
		const result = await collection
			.find({"id": userid})
			.project({"admin": 1})
			.toArray();

		if (result[0]) {
			return Promise.resolve(result[0].admin);
		} else {
			return Promise.reject(500);
		}
	} catch {
		return Promise.reject(500);
	}
};
exports.isAdmin = isAdmin;


exports.isAuthorizedGet = async function (req, res, next) {
	try {
		const id = parseInt(req.params.userid);

		// Req.token_user added by requireAuthentication extracting token payload 
		const admin = await isAdmin(req.token_user);
		const isAuthorized = ((id === req.token_user) || admin);

		if ( isAuthorized ) {
			next();
		} else {
			res.status(403).send({
				error: "Unauthorized to access the specified resource"
			});
		}
	} catch(err) {
		res.status(500).send({
			error: "Error authorizing."
		});
	}
};


exports.isAuthorizedModify = async function (req, res, next) {
	try {
		const id = req.body.userid || req.body.ownerid;

		// match logged in user, user associated to document, new user associated with document
		// Existing and new user check by mongo update commands

		// // Req.token_user added by requireAuthentication extracting token payload 
		const admin = await isAdmin(req.token_user);
		const isAuthorized = ((id === req.token_user) || admin);

		if ( isAuthorized ) {
			next();
		} else {
			res.status(403).send({
				error: "Unauthorized to modify the specified resource"
			});
		}
	} catch(err) {
		res.status(500).send({
			error: "Error authorizing."
		});
	}
};


async function getUserByEmail (email) {
	const db = getDBReference();
	const collection = db.collection('users');
	const results = await collection
		.find({ "email": email })
		.toArray();
	return results[0];	
};


// Used for verifying login email and password work
exports.validateUserEmail = async function  (email, password) {
	const user = await getUserByEmail(email);
	const authenticated = user && await bcrypt.compare(password, user.password);
	return { "authenticated": authenticated, "id": user.id };
};



exports.createAdminPermission = async function (req, res, next) {
	if (req.body.admin == true) {
		const authHeader = req.get('Authorization') || '';
		const authHeaderParts = authHeader.split(' ');
		const token = authHeaderParts[0] === 'Bearer' ? authHeaderParts[1] : null;

		try {
			const payload = jwt.verify(token, secretKey);
			// req.token_user = payload.sub;

			const admin = await isAdmin(payload.sub);
			if (!admin) {
				// throw "Not admin user";
				req.body = null;
				return res.status(403).send({
					error: "Not user authorized to create admin user."			
				});
			} else {
				next();
			}

		} catch (err) {
			req.body = null;
			console.error("  -- error:", err);
			return res.status(401).send({
				error: "Invalid authentication token provided."
			});
		}
	}
	next();
};
