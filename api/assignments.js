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
		getSubmissionsToAssignmentPage,
		// insertNewSubmission,
		getAssignmentInstructorID
} = require('../models/assignments');

const { getCourseInstructorID, 
		studentEnrolledInCourse 
} = require('../models/courses');

const { validateJWT,
		getRole
} = require('../lib/auth');

const {
	fileTypes,
	upload,
	saveSubmissionFile,
	removeUploadedFile
} = require('../models/submissions');


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
		const instructorID = await getAssignmentInstructorID(assignmentID);
		if ((req.tokenUserRole === 'admin') || (req.tokenUserID === instructorID)) {
			const assignmentUpdate = extractValidFields(req.body, AssignmentSchema);
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

// Needs actual files

/* 
 * Fetch the list of all Submissions for an Assignment.
 */
router.get('/:id/submissions', validateJWT, getRole, async (req, res, next) => {
	try {
		const assignmentID = parseInt(req.params.id);
		const instructorID = await getAssignmentInstructorID(assignmentID);
		if ((req.tokenUserRole === 'admin') || (req.tokenUserID === instructorID)) {
			const page = parseInt(req.query.page) || 1;
			var results = await getSubmissionsToAssignmentPage(assignmentID, page);
						
			// Put results into format expected of the API
			results.submissions = results.submissions.map( (result) => { return { 
				studentId: result.studentId,
				assignmentId: result.assignmentId,
				timestamp: result.timestamp,
				file: `/media/${result._id}` 
			} } );

			/*
			 * Generate HATEOAS links for surrounding pages.
			 */
			let links = {};
			if (results.pageNumber < results.totalPages) {
				links.nextPage = `/assignments/${assignmentID}/submissions?page=${results.pageNumber + 1}`;
				links.lastPage = `/assignments/${assignmentID}/submissions?page=${results.totalPages}`;
			}
			if (results.pageNumber > 1) {
				links.prevPage = `/assignments/${assignmentID}/submissions?page=${results.pageNumber - 1}`;
				links.firstPage = `/assignments/${assignmentID}/submissions?page=1`;
			}

			res.status(200).send({ ...results, links });
		} else {
			next(403);
		}
	} catch (err) {
		next(err);
	}
});

// = = = = = = = = = = = = = = = = = = = = = = = = =

/* 
 * Create a new Submission for an Assignment.
 */
router.post('/:id/submissions', validateJWT, getRole, upload.single('file'), async (req, res, next) => {
	if (req.file) {

		req.body.file = req.file.filename;

		try {
			const assignmentID = parseInt(req.params.id);
			const assignment = await getAssignmentByID(assignmentID);
			const enrolledInCourse = await studentEnrolledInCourse(req.tokenUserID, assignment.courseId);

			if ((req.tokenUserRole === 'student') && (enrolledInCourse)) {

				const submission = {
					studentId: req.tokenUserID,
					assignmentId: assignmentID,
					timestamp: new Date().toISOString(),
					path: req.file.path,
					filename: req.file.filename,
					contentType: req.file.mimetype
				};

				// GridFS version of insert
				const id = await saveSubmissionFile(submission);
				await removeUploadedFile(req.file)
				// const id = await insertNewSubmission(submission);
				
				res.status(201).send();
			} else {
				next(403);
			}
		} catch (err) {
			next(err);
		}
	} else {
		console.log("No file");
		next(400);
	}
});



