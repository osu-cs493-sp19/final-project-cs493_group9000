const router = require('express').Router();

exports.router = router;

const { validateAgainstSchema,
		extractValidFields
} = require('../lib/validation');

const { UserSchema,
		RoleSchema,
		getUsers,
		getUserByID,
		insertNewUser,
		getCoursesTaught,
		getCoursesEnrolledIn
} = require('../models/users');

const { generateAuthToken, 
		validateJWT, 
		validateJWTOptional,
		getRole,
		validateUserEmail
} = require('../lib/auth');

/*
 * Schema for a logging in a user.
 */
const LoginSchema = {
	email:		{ required: true },
	password:	{ required: true }
};


// = = = = = = = = = = = = = = = = = = = = = = = = =

// For debugging purposes only

/*
 * Get all users
 */
router.get('/', async (req, res) => {
	try {
		const results = await getUsers();
		res.status(200).send(results);
	} catch (err) {
		next(err);
	}
});

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Create a new user
 * Authentication not required to create student
 * Authentication and admin role required to create instructor / admin
 */
router.post('/', validateJWTOptional, async (req, res, next) => {
	try {
		if (validateAgainstSchema(req.body, UserSchema) && RoleSchema.includes(req.body.role) ) {
			const user = extractValidFields(req.body, UserSchema);
		
			if ( ((user.role === 'admin') || (user.role === 'instructor'))
					&& (req.tokenUserRole != 'admin') ) {
				res.status(403).json({ error: "Only an admin user can create instructor / admin" });
			}

			const result = await insertNewUser(user);
			res.status(201).send({
				"_id": result,
				"links": {
					"user": `/users/${result}`
				}
			});
		} else {
			next(400);
		}
	} catch (err) {
		next(err);
	}
});

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Log in a user
 */
router.post('/login', async (req, res, next) => {
	try {
		if (validateAgainstSchema(req.body, LoginSchema)) {
			const credentials = extractValidFields(req.body, LoginSchema);

			console.log("credentials:", credentials);
			const result = await validateUserEmail(credentials.email, credentials.password);
			console.log("result:", result);
			if (result.authenticated) {
				const token = generateAuthToken(result.id);
				res.status(200).send({
					token: token
				});
			} else {
				next(401);
			}
		} else {
			next(400);
		}
	} catch (err) {
		next(err);
	}
});

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Fetch data about a specific use
 */
router.get('/:id', validateJWT, getRole, async (req, res, next) => {
	try {
		const id = parseInt(req.params.id);
		if ((req.tokenUserID === id) || (req.tokenUserRole === 'admin')) {
			const user = await getUserByID(id);
			
			if (user.role === 'instructor') {
				const coursesTaught = await getCoursesTaught(id);
				var result = { ...user, coursesTaught: coursesTaught };
			} else if (user.role === 'student') {
				const coursesTaking = await getCoursesEnrolledIn(id);
				var result = { ...user, coursesTaking: coursesTaking };
			} else {
				var result = user;
			}

			res.status(200).send(result);
		} else {
			next(403);
		}
	
	} catch (err) {
		console.log("Error: ", err);
		next(err);
	}
});


