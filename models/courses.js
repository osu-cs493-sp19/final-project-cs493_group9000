const { getDBReference } = require('../lib/mongo');
const { ObjectId } = require('mongodb');
const { extractValidFields } = require('../lib/validation');

/*
 * Schema for a Course.
 */
const CourseSchema = {
	subject:		{ required: true },
	number:			{ required: true },
	title:			{ required: true },
	term:			{ required: true },
	instructorId:	{ required: true },
	studentIds:		{ required: false}
};
exports.CourseSchema = CourseSchema;


// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Get all courses
 */
exports.getCourses = async function () {
	try {
		const db = getDBReference();
		const collection = db.collection('courses');
		const results = await collection.find().toArray();
		return Promise.resolve(results);
	} catch {
		return Promise.reject(500);
	}
}

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Insert new course into the DB
 */
exports.insertNewCourse = async function (course) {
	try {
		const courseToInsert = extractValidFields(course, CourseSchema);
		const db = getDBReference();
		const collection = db.collection('courses');
		const result = await collection.insertOne(courseToInsert);
		return Promise.resolve( {"insertedID": result.insertedId} );
	} catch {
		return Promise.reject(500);
	}
}

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Get course info by ID
 */
exports.getCourseByID = async function (courseID) {
	try {
		const db = getDBReference();
		const collection = db.collection('courses');

		if (!ObjectId.isValid(courseID)) {
			console.log("courseID", courseID, "is not valid");
			return Promise.reject(404);
		} else {
			const results = await collection
				.find({ _id: new ObjectId(courseID) })
				.toArray();
			return Promise.resolve(results[0]);
		}
	} catch {
		return Promise.reject(500);
	}
}

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Update a course in the DB
 */
exports.updateCourse = async function (courseID, courseUpdate) {
	try {
		const db = getDBReference();
		const collection = db.collection('courses');
		const result = await collection.findAndModify(
			{ "courseId": courseID },
			{ $update: courseUpdate }		// This might not be exactly correct
		);
		if (result.matchedCount == 1) {
			return Promise.resolve(courseID);
		} else {
			return Promise.reject(404);
		}
	} catch {
		return Promise.reject(500);
	}
}

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Delete a course in the DB
 */
exports.deleteCourse = async function (courseID) {
	try {
		const db = getDBReference();
		const collection = db.collection('courses');
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
 * Get list of students in a course
 */
exports.getStudentsInCourse = async function (courseID) {
	try {
		const db = getDBReference();
		const collection = db.collection('courses');
		const results = await collection
			.find({ "_id": ObjectId(courseID)})
			.toArray();
		if (results[0]) {
			return Promise.resolve(results[0].studentIds);
		} else {
			return Promise.reject(404);
		}
	} catch {
		return Promise.reject(500);
	}
}

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Add a student to a course
 */
exports.addStudentToCouse = async function (courseID, studentID) {
	try {
		const db = getDBReference();
		const collection = db.collection('courses');
		const result = await collection.updateOne(
			{ "courseId": courseID },
			{ $push: { students: studentID } }		
		);
		if (result.matchedCount == 1) {
			return Promise.resolve(courseID);
		} else {
			return Promise.reject(404);
		}
	} catch {
		return Promise.reject(500);
	}
}

// = = = = = = = = = = = = = = = = = = = = = = = = =

// Probably no need for a function to return CSV, 
// that will be handled by API via get courses/:id/students

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Get all assignments in a course
 */
exports.getAssignmentsOfCourse = async function (courseID) {
	try {
		const db = getDBReference();
		const collection = db.collection('assignments');
		const results = await collection
			.find({ "courseId": ObjectId(courseID)})
			.toArray();
		return Promise.resolve(results);
	} catch {
		return Promise.reject(500);
	}
}




