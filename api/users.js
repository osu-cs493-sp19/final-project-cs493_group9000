const router = require('express').Router();

exports.router = router;

const { validateAgainstSchema,
		extractValidFields
} = require('../lib/validation');

const { UserSchema,
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
		// console.log(err);
		// res.status(500).send({
		// 	error: "Error fetching users.  Try again later."
		// });
		next(err);
	}
});

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Create a new user
 */
router.post('/', async (req, res, next) => {
	try {
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
			// res.status(400).send({
			// 	error: "Request body does not contain a valid User."
			// });
			next(err);
		}
	} catch (err) {

	}
});

// = = = = = = = = = = = = = = = = = = = = = = = = =

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
		const id = parseInt(req.params.userid);
		const user = await getUserInfo(id);
		res.status(200).send(user);
	} catch (err) {
		next(err);
	}
});


