const router = require('express').Router();

exports.router = router;

const { validateAgainstSchema,
		extractValidFields
} = require('../lib/validation');

const { UserSchema,
		// RoleSchema,
		getUsers,
		getUserByID,
		insertNewUser
} = require('../models/users');

const { generateAuthToken, 
		requireAuthentication, 
		isAdmin, 
		isAuthorizedGet, 
		validateUserEmail,
		createAdminPermission 
} = require('../lib/auth');



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

// Should make sure email is unique

/*
 * Create a new user
 */
router.post('/', async (req, res, next) => {
	try {
		console.log(req.body);
		// if (validateAgainstSchema(req.body, UserSchema) && RoleSchema.includes(req.body.role) ) {
		if (validateAgainstSchema(req.body, UserSchema)) {
			const user = extractValidFields(req.body, UserSchema)
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

// Needs testing

/*
 * Log in a user
 */
router.post('/login', async (req, res, next) => {
	res.status(200).send({});
	try {

	} catch (err) {
		next(err);
	}
});

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Fetch data about a specific user
 */
router.get('/:id', async (req, res, next) => {
	try {
		const id = parseInt(req.params.id);
		const user = await getUserByID(id);
		res.status(200).send(user);
	} catch (err) {
		console.log("Error: ", err);
		next(err);
	}
});


