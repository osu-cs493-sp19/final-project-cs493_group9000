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
		insertNewSubmission,
		getAssignmentInstructorID
} = require('../models/assignments');

const { getCourseInstructorID, 
		studentEnrolledInCourse 
} = require('../models/courses');

const { validateJWT,
		getRole
} = require('../lib/auth');

// Need for file submissions
const multer = require('multer');
const crypto = require('crypto');
const fs     = require('fs');

const {
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
			const results = await getSubmissionsToAssignmentPage(assignmentID, page);
			
			console.log("results:", results);

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


const fileTypes = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'application/pdf': 'pdf',
	'text/plain': 'txt'
};


const upload = multer({
	storage: multer.diskStorage({
		destination: `${__dirname}/uploads`,
		filename: (req, file, callback) => {
			const basename = crypto.pseudoRandomBytes(16).toString('hex');
			const extension = fileTypes[file.mimetype];
			callback(null, `${basename}.${extension}`);
		}
	}),
	fileFilter: (req, file, callback) => {
		callback(null, !!fileTypes[file.mimetype]);
	}
});




// Needs testing

// User needs to be student and enrolled in course

// Authorization works

// Needs actual files

/* 
 * Create a new Submission for an Assignment.
 */
router.post('/:id/submissions', validateJWT, getRole, upload.single('file'), async (req, res, next) => {
	if (req.file) {

		console.log("FILE:", req.file);
		req.body.file = req.file.filename;

		try {

			const assignmentID = parseInt(req.params.id);
			// console.log("assignmentID:", assignmentID);
			const assignment = await getAssignmentByID(assignmentID);
			// console.log("assignment:", assignment);
			const enrolledInCourse = await studentEnrolledInCourse(req.tokenUserID, assignment.courseId);
			// console.log("enrolledInCourse:", enrolledInCourse);

			if ((req.tokenUserRole === 'student') && (enrolledInCourse)) {

				const submission = {
					studentId: req.tokenUserID,
					assignmentId: assignmentID,
					timestamp: new Date().toISOString(),
					path: req.file.path,
					filename: req.file.filename,
					contentType: req.file.mimetype
				};


				console.log("SUBMISSION:\n", submission);

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





// router.post('/:id/submissions', validateJWT, getRole, async (req, res, next) => {
// 	try {

// 		const assignmentID = parseInt(req.params.id);
// 		// console.log("assignmentID:", assignmentID);
// 		const assignment = await getAssignmentByID(assignmentID);
// 		// console.log("assignment:", assignment);
// 		const enrolledInCourse = await studentEnrolledInCourse(req.tokenUserID, assignment.courseId);
// 		// console.log("enrolledInCourse:", enrolledInCourse);

// 		if ((req.tokenUserRole === 'student') && (enrolledInCourse)) {

// 			req.body.assignmentId = assignmentID;
// 			req.body.studentId = req.tokenUserID;
// 			req.body.timestamp = new Date().toISOString();


// 			if (validateAgainstSchema(req.body, SubmissionSchema)) {
// 				// This will need to be a multipart form data
// 				const submission = extractValidFields(req.body, SubmissionSchema);

// 				console.log("submission:", submission);

// 				const id = await insertNewSubmission(submission);
// 				res.status(201).send();
// 			} else {
// 				next(400);
// 			}
// 		} else {
// 			next(403);
// 		}
// 	} catch (err) {
// 		next(err);
// 	}
// });






