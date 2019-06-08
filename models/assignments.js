const { getDBReference } = require('../lib/mongo');
const { ObjectId } = require('mongodb');

/*
 * Schema for an Assignment.
 */
const AssignmentSchema = {
	courseId:	{ required: true },
	title:		{ required: true },
	points:		{ required: true },
	due:		{ required: true }
}
exports.AssignmentSchema = AssignmentSchema;

/*
 * Schema for a Submission.
 */
const SubmissionSchema = {
	assignmentId:	{ required: true },
	studentId:		{ required: true },
	timestamp:		{ required: true },
	file:			{ required: true }
}
exports.SubmissionSchema = SubmissionSchema;


// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Insert new assignment into the DB
 */
exports.insertNewAssignment = async function (assignment) {

}

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Get assignment info by ID
 */
exports.getAssignmentByID = async function (assignmentID) {

}

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Update a assignment in the DB
 */
exports.updateAssignment = async function (assignmentID, assignmentUpdate) {

}

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Delete a assignment in the DB
 */
exports.deleteAssignment = async function (assignmentID) {

}

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Get list of assignements for an assignment
 */
exports.getSubmissionsToAssignment = async function (assignmentID) {

}

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Add a submission to an assignment
 */
exports.insertNewSubmission = async function (assignmentID, submission) {

}


