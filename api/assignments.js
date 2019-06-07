const router = require('express').Router();

exports.router = router;

/*
 * Create a new Assignment.
 */
router.post('/', async (req, res, next) => {
	res.status(200).send({});
});

/* 
 * Fetch data about a specific Assignment.
 */
router.get('/:id', async (req, res, next) => {
	res.status(200).send({});
});

/* 
 * Update data for a specific Assignment.
 */
router.patch('/:id', async (req, res, next) => {
	res.status(200).send({});
});

/*
 * Remove a specific Assignment from the database.
 */ 
router.delete('/:id', async (req, res, next) => {
	res.status(200).send({});
});

/* 
 * Fetch the list of all Submissions for an Assignment.
 */
router.get('/:id/submissions', async (req, res, next) => {
	res.status(200).send({});
});

/* 
 * Create a new Submission for an Assignment.
 */
router.post('/:id/submissions', async (req, res, next) => {
	res.status(200).send({});
});

