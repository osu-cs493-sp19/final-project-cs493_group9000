const router = require('express').Router();

exports.router = router;

const { validateAgainstSchema,
		extractValidFields
} = require('../lib/validation');

const { AssignmentSchema,
		SubmissionSchema,
		getAssignments,
		insertNewAssignment,
		getAssignmentByID,
		updateAssignment,
		deleteAssignment,
		getSubmissionsToAssignment,
		insertNewSubmission,
		getAssignmentInstructorID
} = require('../models/assignments');

const { studentEnrolledInCourse } = require('../models/courses');

const { validateJWT,
		getRole
} = require('../lib/auth');


// = = = = = = = = = = = = = = = = = = = = = = = = =

// For testing purposes only

/*
 * Fetch the list of all assignments.
 */
router.get('/', async (req, res, next) => {
	try {
		const results = await getAssignments();
		res.status(200).send(results);
	} catch (err) {
		next(err);
	}
});

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Create a new Assignment.
 */
router.post('/', validateJWT, getRole, async (req, res, next) => {
	try {
		if (validateAgainstSchema(req.body, AssignmentSchema)) {
			const assignment = extractValidFields(req.body, AssignmentSchema);
			console.log("assignment:", assignment);
			
			const instructorID = await getCourseInstructorID(assignment.courseId);
			if ((req.tokenUserRole === 'admin') || (req.tokenUserID === instructorID)) {
				const result = await insertNewAssignment(assignment);
				res.status(201).send({
					"_id": result.insertedID,
					"links": {
						"assignment": `/assignments/${result.insertedID}`
					}
				});
			} else {
				next(403);
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

/* 
 * Update data for a specific Assignment.
 */
router.patch('/:id', validateJWT, getRole, async (req, res, next) => {
	try {
		const assignmentID = parseInt(req.params.id);
		const assignmentUpdate = extractValidFields(req.body, AssignmentSchema);
		const instructorID = await getAssignmentInstructorID(assignmentID);
		if ((req.tokenUserRole === 'admin') || (req.tokenUserID === instructorID)) {
			const result = await updateAssignment(assignmentID, assignmentUpdate);
			res.status(200).send();
		} else {
			next(403);
		}
	} catch (err) {
		next(err);
	}
});

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Remove a specific Assignment from the database.
 */ 
router.delete('/:id', validateJWT, getRole, async (req, res, next) => {
	try {
		const assignmentID = parseInt(req.params.id);
		const instructorID = await getAssignmentInstructorID(assignmentID);
		if ((req.tokenUserRole === 'admin') || (req.tokenUserID === instructorID)) {
			const result = await deleteAssignment(assignmentID);
			res.status(204).send();
		} else {
			next(403);
		}
	} catch (err) {
		next(err);
	}
});

// = = = = = = = = = = = = = = = = = = = = = = = = =

// Needs testing

/* 
 * Fetch the list of all Submissions for an Assignment.
 */
router.get('/:id/submissions', validateJWT, getRole, async (req, res, next) => {
	try {
		const assignmentID = parseInt(req.params.id);
		const instructorID = await getAssignmentInstructorID(assignmentID);
		if ((req.tokenUserRole === 'admin') || (req.tokenUserID === instructorID)) {
			const submissions = await getSubmissionsToAssignment(assignmentID);
			res.status(200).json(submissions);
		} else {
			next(403);
		}
	} catch (err) {
		next(err);
	}
});

// = = = = = = = = = = = = = = = = = = = = = = = = =

// Needs testing

// User needs to be student and enrolled in course

/* 
 * Create a new Submission for an Assignment.
 */
router.post('/:id/submissions', validateJWT, getRole, async (req, res, next) => {
	try {
		const assignmentID = parseInt(req.params.id);

		const assignment = await getAssignmentByID(assignmentID);
		const enrolledInCourse = await studentEnrolledInCourse(req.tokenUserID, assignment.courseId);

		if (enrolledInCourse) {
			if (validateAgainstSchema(req.body, SubmissionSchema)) {
				// This will need to be a multipart form data
				const submission = extractValidFields(req.body, SubmissionSchema);
				const id = await insertNewSubmission(submission);
				res.status(201).send();
			} else {
				next(err);
			}
		} else {
			next(403);
		}
	} catch (err) {
		next(err);
	}
});






