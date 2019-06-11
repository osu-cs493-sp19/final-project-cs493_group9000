const { getDBReference } = require('../lib/mongo');
const { ObjectId } = require('mongodb');
const { extractValidFields } = require('../lib/validation');
const dot = require('mongo-dot-notation');

/*
 * Schema for an Assignment.
 */
const AssignmentSchema = {
	courseId:	{ required: true, type: "integer" },
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

/*
 * Assignments pagination page size
 */ 
// const pageSize = 2;



// = = = = = = = = = = = = = = = = = = = = = = = = =

// For testing purposes only

/*
 * Get all assignments
 */
exports.getAssignments = async function () {
	try {
		const db = getDBReference();
		const collection = db.collection('assignments');
		const results = await collection
			.find()
			.project({ 
				_id: 0
			})			
			.toArray();
		return Promise.resolve(results);
	} catch {
		return Promise.reject(500);
	}
}

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Insert new assignment into the DB
 */
exports.insertNewAssignment = async function (assignment) {
	try {
		let assignmentToInsert = extractValidFields(assignment, AssignmentSchema);
		const db = getDBReference();
		const collection = db.collection('assignments');
		const count = await collection.countDocuments();
		assignmentToInsert.id = count;
		const result = await collection.insertOne(assignmentToInsert);
		return Promise.resolve( {"insertedID": assignmentToInsert.id } );
	} catch {
		return Promise.reject(500);
	}
}

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Get assignment info by ID
 */
exports.getAssignmentByID = async function (assignmentID) {
	try {
		const db = getDBReference();
		const collection = db.collection('assignments');
		const results = await collection
			.find({ id: assignmentID })
			.project({ 
				_id: 0,
				id: 0
			})			
			.toArray();
		if (results[0]) {
			return Promise.resolve(results[0]);
		} else {
			return Promise.reject(404);
		}
	} catch {
		return Promise.reject(500);
	}
}

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Update a assignment in the DB
 */
exports.updateAssignment = async function (assignmentID, assignmentUpdate) {
	try {
		const db = getDBReference();
		const collection = db.collection('assignments');
		const result = await collection.updateOne(
			{ "id": assignmentID },
			dot.flatten(assignmentUpdate)
		);
		if (result.matchedCount == 1) {
			return Promise.resolve(assignmentID);
		} else {
			return Promise.reject(404);
		}
	} catch {
		return Promise.reject(500);
	}
}

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Delete a assignment in the DB
 */
exports.deleteAssignment = async function (assignmentID) {
	try {
		const db = getDBReference();
		const collection = db.collection('assignments');
		const result = await collection.deleteOne(
			{ "id": assignmentID }
		);
		if (result.deletedCount == 1) {
			return Promise.resolve(assignmentID);
		} else {
			return Promise.reject(404);
		}
	} catch {
		return Promise.reject(500);
	}
}

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Get list of assignments for an assignment
 */
exports.getSubmissionsToAssignment = async function (assignmentID) {
	try {
		const db = getDBReference();
		const collection = db.collection('submissions');
		const results = await collection
			.find({ "assignmentId": assignmentID })
			.toArray();
		return Promise.resolve(results);
	} catch {
		return Promise.reject(500);
	}
}

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Add a submission to an assignment
 */
exports.insertNewSubmission = async function (submission) {
	try {
		const db = getDBReference();
		const collection = db.collection('submissions');
		const result = await collection.insertOne(submission);
		return Promise.resolve( {"insertedID": result.insertedId} );
	} catch {
		return Promise.reject(500);
	}
}


