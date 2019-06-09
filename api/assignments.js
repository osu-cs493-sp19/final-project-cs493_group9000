const router = require('express').Router();

exports.router = router;

const { validateAgainstSchema,
		extractValidFields
} = require('../lib/validation');

const { AssignmentSchema,
		SubmissionSchema,
		insertNewAssignment,
		getAssignmentByID,
		updateAssignment,
		deleteAssignment,
		getSubmissionsToAssignment,
		insertNewSubmission
} = require('../models/assignments');


// = = = = = = = = = = = = = = = = = = = = = = = = =

// Needs testing

/*
 * Create a new Assignment.
 */
router.post('/', async (req, res, next) => {
	try {
		if (validateAgainstSchema(req.body, AssignmentSchema)) {
			const assignment = extractValidFields(req.body, AssignmentSchema);
			const result = await insertNewAssignment(assignment);
			res.status(201).send({
				"_id": result,
				"links": {
					"assignment": `/assignments/${result}`
				}
			});
		} else {
			next(err);
		}
	} catch (err) {
		next(err);
	}
});

// = = = = = = = = = = = = = = = = = = = = = = = = =

// Needs testing

/* 
 * Fetch data about a specific Assignment.
 */
router.get('/:id', async (req, res, next) => {
	try {
		const assignmentID = parseInt(req.params.id);
		const assignment = await getAssignmentByID(assignmentID);
		res.status(200).json(assignment);
	} catch (err) {
		next(err);
	}
});

// = = = = = = = = = = = = = = = = = = = = = = = = =

// Needs testing

/* 
 * Update data for a specific Assignment.
 */
router.patch('/:id', async (req, res, next) => {
	try {
		const assignmentID = parseInt(req.params.id);
		const assignmentUpdate = extractValidFields(req.body, AssignmentSchema);
		const result = await updateAssignment(assignmentID, assignmentUpdate);
		res.status(200).send();
	} catch (err) {
		next(err);
	}
});

// = = = = = = = = = = = = = = = = = = = = = = = = =

// Needs testing

/*
 * Remove a specific Assignment from the database.
 */ 
router.delete('/:id', async (req, res, next) => {
	try {
		const assignmentID = parseInt(req.params.id);
		const result = await deleteAssignment(assignmentID);
		res.status(204).send();
	} catch (err) {
		next(err);
	}
});

// = = = = = = = = = = = = = = = = = = = = = = = = =

// Needs testing

/* 
 * Fetch the list of all Submissions for an Assignment.
 */
router.get('/:id/submissions', async (req, res, next) => {
	try {
		const assignmentID = parseInt(req.params.id);
		const submissions = await getSubmissionsToAssignment(assignmentID);
		res.status(200).json(submissions);
	} catch (err) {
		next(err);
	}
});

// = = = = = = = = = = = = = = = = = = = = = = = = =

// Needs testing

/* 
 * Create a new Submission for an Assignment.
 */
router.post('/:id/submissions', async (req, res, next) => {
	try {
		const assignmentID = parseInt(req.params.id);
		if (validateAgainstSchema(req.body, SubmissionSchema)) {
			// This will need to be a multipart form data
			const submission = extractValidFields(req.body, SubmissionSchema);
			const id = await insertNewSubmission(submission);
			res.status(201).send();
		} else {
			next(err);
		}
	} catch (err) {
		next(err);
	}
});






