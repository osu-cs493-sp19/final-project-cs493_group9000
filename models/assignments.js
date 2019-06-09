const { getDBReference } = require('../lib/mongo');
const { ObjectId } = require('mongodb');
const { extractValidFields } = require('../lib/validation');

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
	try {
		const assignmentToInsert = extractValidFields(assignment, AssignmentSchema);
		const db = getDBReference();
		const collection = db.collection('assignments');
		const result = await collection.insertOne(assignmentToInsert);
		return Promise.resolve( {"insertedID": result.insertedId} );
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
		if (!ObjectId.isValid(assignmentID)) {
			console.log("AssignmentID", assignmentID, "is not valid");
			return Promise.reject(404);
		} else {
			const results = await collection
				.find({ _id: new ObjectId(assignmentID) })
				.toArray();
			return Promise.resolve(results[0]);
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
		const result = await collection.findAndModify(
			{ "assignmentId": assignmentID },
			{ $update: assignmentUpdate }		// This might not be exactly correct
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
			{ "_id": ObjectId(courseID) }
		);
		if (result.deletedCount == 1) {
			return Promise.resolve(reviewID);
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


