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
	}
};

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Middleware to get role if authentication provided, else continue
 */
exports.validateJWTOptional = async function (req, res, next) {
	const authHeader = req.get('Authorization') || '';
	const authHeaderParts = authHeader.split(' ');
	const token = authHeaderParts[0] === 'Bearer' ? authHeaderParts[1] : null;

	if (token) {
		try {
			const payload = jwt.verify(token, secretKey);
			req.tokenUserID = payload.sub;
			const user = await getUserByID(req.tokenUserID, 0);
			req.tokenUserRole = user.role;
			next();
		} catch (err) {
			console.error("  -- error:", err);
			res.status(401).send({
				error: "Invalid authentication token provided."
			});
		}	
	} else {
		// No authentication provided, but no error, continue
		next();
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

/*
 * Get and add role of authenticated user to req
 */
exports.getRole = async function (req, res, next) {
	try {
		// Get logged in user info
		const user = await getUserByID(req.tokenUserID, 0);
		req.tokenUserRole = user.role;
		next();
	} catch (err) {
		res.status(500).send({
			error: "Error authorizing"
		});
	}
};

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Require that a user is admin, as determined by getRole, else 403 error
 */
exports.requireIsAdmin = function (req, res, next) {
	console.log("req.tokenUserRole:", req.tokenUserRole);
	if (req.tokenUserRole === 'admin') {
		next();
	} else {
		next(403);
	}
}

