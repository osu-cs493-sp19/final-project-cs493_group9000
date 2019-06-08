const { getDBReference } = require('../lib/mongo');
const { ObjectId } = require('mongodb');

/*
 * Schema for a Course.
 */
const CourseSchema = {
	subject:		{ required: true },
	number:			{ required: true },
	title:			{ required: true },
	term:			{ required: true },
	instructorId:	{ required: true }
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

}

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Get course info by ID
 */
exports.getCourseByID = async function (courseID) {

}

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Update a course in the DB
 */
exports.updateCourse = async function (courseID, courseUpdate) {

}

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Delete a course in the DB
 */
exports.deleteCourse = async function (courseID) {

}

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Get list of students in a course
 */
exports.getStudentsInCourse = async function (courseID) {

}

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Add a student to a course
 */
exports.addStudentToCouse = async function (courseID, studentID) {

}

// = = = = = = = = = = = = = = = = = = = = = = = = =

// Probably no need for a function to return CSV, 
// that will be handled by API via get courses/:id/students

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Get all assignments in a course
 */
exports.getAssignmentsOfCourse = async function (courseID) {

}




