const { getDBReference } = require('../lib/mongo');
const { ObjectId } = require('mongodb');
const { extractValidFields } = require('../lib/validation');
const { getCourseInstructorID } = require('../models/courses');
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
const pageSize = 2;



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
async function getAssignmentByID (assignmentID) {
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
exports.getAssignmentByID = getAssignmentByID;

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
 * Get list of assignments for an assignment
 */
exports.getSubmissionsToAssignmentPage = async function (assignmentID, page) {
	try {
		const db = getDBReference();
		const collection = db.collection('submissions');

		
		const results = await collection
			.find({ "assignmentId": assignmentID })
			.sort({ id: 1 })
			.project({ _id: 0 })
			.toArray();

		if (results) {

			const count = results.length;
			const lastPage = Math.ceil(count / pageSize);
			page = (page > lastPage) ? lastPage : page;
			page = (page < 1) ? 1 : page;
			const offset = (page - 1) * pageSize;

			// return Promise.resolve(results);
			return Promise.resolve({
				submissions: results.slice(offset, offset+pageSize),
				pageNumber: page,
				totalPages: lastPage,
				pageSize: pageSize,
				count: count
			});
		} else {
			return Promise.reject(404);
		}

	} catch (err) {
		console.log(err);
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

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Get instructor ID of course assgiment is for 
 */
exports.getAssignmentInstructorID = async function (assignmentID) {
	try {
		const assignment = await getAssignmentByID(assignmentID);
		const instructorID = await getCourseInstructorID(assignment.courseId);
		return Promise.resolve( instructorID );
	} catch {
		return Promise.reject(500);
	}
}

