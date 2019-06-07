const router = require('express').Router();

exports.router = router;

/*
 * Create a new user
 */
router.post('/', async (req, res, next) => {
	res.status(201).send({});
});

/*
 * Log in a user
 */
router.post('/login', async (req, res, next) => {
	res.status(200).send({});
});

/*
 * Fetch data about a specific user
 */
router.get('/:id', async (req, res, next) => {
	res.status(200).send({});
});


