const { getDBReference } = require('../lib/mongo');
const { getUserByEmail, getUserByID } = require('../models/users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



const secretKey = 'SuperSecret!';


// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Generate a token to use in authentication
 */
exports.generateAuthToken = function (userID) {
	const payload = {
		sub: userID
	};
	const token = jwt.sign(payload, secretKey, { expiresIn: '24h' });
	return token;
};

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Middleware to require authentication via token
 */
exports.validateJWT = function (req, res, next) {
	const authHeader = req.get('Authorization') || '';
	const authHeaderParts = authHeader.split(' ');
	const token = authHeaderParts[0] === 'Bearer' ? authHeaderParts[1] : null;

	try {
		const payload = jwt.verify(token, secretKey);
		req.tokenUserID = payload.sub;
		next();
	} catch (err) {
		console.error("  -- error:", err);
		res.status(401).send({
			error: "Invalid authentication token provided."
		});
		// next(401);
	}
};

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Verify that provided email and password log in a user
 */
exports.validateUserEmail = async function (email, password) {
	try {
		const user = await getUserByEmail(email);
		console.log("User:", user);
		const authenticated = user && await bcrypt.compare(password, user.password);
		return Promise.resolve({ "authenticated": authenticated, "id": user.id });
	} catch (err) {
		if ( err === 404 ) {
			return Promise.reject(401); // Not found, indicate invalid credentials
		} else {
			return Promise.reject(500);
		}
	}
};

// = = = = = = = = = = = = = = = = = = = = = = = = =

// /*
//  * Verify that provided email and password log in a user
//  */
// // exports.getPermissions = async function (req, res, next) {
// // exports.getPermissionsAux = async function (req, res, next) {
// async function getPermissionsAux (req, res, next) {
// 	try {
// 		// Get logged in user info
// 		const user = await getUserByID(req.tokenUserID, 0);
// 		const params = req.params;
// 		console.log("USER:\n", user);
// 		console.log("PARAMS:\n", req.params);

// 		req.role = user.role;

// 		// // // Admin is always authorized
// 		if (user.role === 'admin') {
// 			console.log("ADMIN");
// 			req.permissions = ['read', 'write'];
// 			// next(405);
// 		} 
// 		else if (user.role === 'instructor') {
// 			console.log("INSTRUCTOR");
// 			req.permissions = ['read', 'write'];
// 			// if (user.id == params.id) {
// 				// res.end();
// 			// next(406);
// 			// }
// 		} 
// 		else if (user.role === 'student') {
// 			console.log("STUDENT");
// 			req.permissions = ['read'];
// 			// if (user.id == req.params.id) {
// 			// next(407);
// 			// }
// 		}
// 		//  else {
// 		// 	next(408);
// 		// }

// 		// next(403);
// 		next();

// 	} catch (err) {
// 		// next(500);
// 		res.status(500).send({
// 			error: "Error authorizing"
// 		});
// 	}
// };




// exports.getPermissions = function (type) {
// 	return getPermissionsAux;
// }



exports.getRole = async function (req, res, next) {
	try {
		// Get logged in user info
		const user = await getUserByID(req.tokenUserID, 0);
		const params = req.params;
		req.tokenUserRole = user.role;
		next();
	} catch (err) {
		res.status(500).send({
			error: "Error authorizing"
		});
	}
};

exports.requireIsAdmin = function (req, res, next) {
	console.log("req.tokenUserRole:", req.tokenUserRole);
	if (req.tokenUserRole === 'admin') {
		next();
	} else {
		next(403);
	}
}








/*
 * Middleware to verify user is admin
 */
async function isAdmin (userid) {
	// try {
	// 	const db = getDBReference();
	// 	const collection = db.collection('users');
	// 	const result = await collection
	// 		.find({"id": userid})
	// 		.project({"admin": 1})
	// 		.toArray();

	// 	if (result[0]) {
	// 		return Promise.resolve(result[0].admin);
	// 	} else {
	// 		return Promise.reject(500);
	// 	}
	// } catch {
	// 	return Promise.reject(500);
	// }
};
exports.isAdmin = isAdmin;

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Insert new assignment into the DB
 */
// exports.isAuthorizedGet = async function (req, res, next) {
// 	try {
// 		const id = parseInt(req.params.userid);

// 		// Req.token_user added by requireAuthentication extracting token payload 
// 		const admin = await isAdmin(req.token_user);
// 		const isAuthorized = ((id === req.token_user) || admin);

// 		if ( isAuthorized ) {
// 			next();
// 		} else {
// 			res.status(403).send({
// 				error: "Unauthorized to access the specified resource"
// 			});
// 		}
// 	} catch(err) {
// 		res.status(500).send({
// 			error: "Error authorizing."
// 		});
// 	}
// };

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Insert new assignment into the DB
 */
// exports.isAuthorizedModify = async function (req, res, next) {
// 	try {
// 		const id = req.body.userid || req.body.ownerid;

// 		// match logged in user, user associated to document, new user associated with document
// 		// Existing and new user check by mongo update commands

// 		// // Req.token_user added by requireAuthentication extracting token payload 
// 		const admin = await isAdmin(req.token_user);
// 		const isAuthorized = ((id === req.token_user) || admin);

// 		if ( isAuthorized ) {
// 			next();
// 		} else {
// 			res.status(403).send({
// 				error: "Unauthorized to modify the specified resource"
// 			});
// 		}
// 	} catch(err) {
// 		res.status(500).send({
// 			error: "Error authorizing."
// 		});
// 	}
// };

