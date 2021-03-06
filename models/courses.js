const { getDBReference } = require('../lib/mongo');
const { ObjectId } = require('mongodb');
const { extractValidFields } = require('../lib/validation');
const dot = require('mongo-dot-notation');

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


/*
 * Courses pagination page size
 */ 
// Change as needed
// Set low currently to generate multiple pages
const pageSize = 2;

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Get all courses
 */
exports.getCourses = async function () {
	try {
		const db = getDBReference();
		const collection = db.collection('courses');
		const results = await collection
			.find()
			.project({ 
				_id: 0,
				// id: 0,
				studentIds: 0
			})			
			.toArray();
		return Promise.resolve(results);
	} catch {
		return Promise.reject(500);
	}
}

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Get courses by page
 */
exports.getCoursesPage = async function (page) {
	try {
		const db = getDBReference();
		const collection = db.collection('courses');

		const count = await collection.countDocuments(); 
		const lastPage = Math.ceil(count / pageSize);
		page = (page > lastPage) ? lastPage : page;
		page = (page < 1) ? 1 : page;
		const offset = (page - 1) * pageSize;

		const results = await collection
			.find()
			.sort({ id: 1 })
			.skip(offset)
			.limit(pageSize)
			.project({ 
				_id: 0,
				// id: 0,
				studentIds: 0
			})			
			.toArray();

		return Promise.resolve({
			courses: results,
			pageNumber: page,
			totalPages: lastPage,
			pageSize: pageSize,
			count: count
		});
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
		let courseToInsert = extractValidFields(course, CourseSchema);
		const db = getDBReference();
		const collection = db.collection('courses');
		const count = await collection.countDocuments();
		courseToInsert.id = count;
		courseToInsert.studentIds;
		const result = await collection.insertOne(courseToInsert);
		return Promise.resolve( {"insertedID": courseToInsert.id } );
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
		const results = await collection
			.find({ id: courseID })
			.project({ 
				_id: 0,
				id: 0,
				studentIds: 0
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
 * Update a course in the DB
 */
exports.updateCourse = async function (courseID, courseUpdate) {
	try {
		const db = getDBReference();
		const collection = db.collection('courses');
		const result = await collection.updateOne(
			{ "id": courseID },
			dot.flatten(courseUpdate)
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
			{ "id": courseID }
		);
		if (result.deletedCount == 1) {
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
 * Get list of student IDs in a course
 */
exports.getStudentIDsInCourse = async function (courseID) {
	try {
		const db = getDBReference();
		const collection = db.collection('courses');
		const results = await collection
			.find({ "id": courseID })
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
exports.addStudentsToCourse = async function (courseID, studentIDs) {
	try {
		const db = getDBReference();
		const collection = db.collection('courses');
		const result = await collection.updateOne(
			{ "id": courseID },
			{ $push: { "studentIds": { $each: studentIDs } } }	
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
 * Remove a student from a course
 */
exports.removeStudentsFromCourse = async function (courseID, studentIDs) {
	try {
		const db = getDBReference();
		const collection = db.collection('courses');
		const result = await collection.updateOne(
			{ "id": courseID },
			{ $pull: { "studentIds": { $in: studentIDs } } }	
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
 * Get info of students in a course
 */
async function getStudentsInCourse (courseID) {
	try {
		const db = getDBReference();
		const collection = db.collection('users');

		// Get student IDs
		const tmp = await db.collection('courses').find({ "id": courseID }).toArray();
		const studentIDs = tmp[0] ? tmp[0].studentIds : []

		// Get students' info
		const results = await collection.find(
			{ id: { $in: studentIDs } }
		).toArray();

		if (results) {
			return Promise.resolve(results);
		} else {
			return Promise.reject(404);
		}
	} catch {
		return Promise.reject(500);
	}
}
exports.getStudentsInCourse = getStudentsInCourse;
// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Get all assignments in a course
 */
exports.getAssignmentsOfCourse = async function (courseID) {
	try {
		// Verify that the course exists
		const courseResults = await getDBReference().collection('courses').find({ id: courseID }).toArray();
		if (!courseResults[0]) {
			return Promise.reject(404);
		}
		const db = getDBReference();
		const collection = db.collection('assignments');
		const results = await collection
			.find({ "courseId": courseID })
			.toArray();
		if (results) {
			return Promise.resolve( results.map( result => result.id ) );
		} else {
			return Promise.reject(404);
		}
	} catch {
		return Promise.reject(500);
	}
}

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Get ID of the instructor of the course 
 */
exports.getCourseInstructorID = async function (courseID) {
	try {
		const db = getDBReference();
		const collection = db.collection('courses');
		const results = await collection
			.find({ id: courseID })
			.project({ 
				_id: 0,
				id: 0,
				studentIds: 0
			})			
			.toArray();
		if (results[0]) {
			return Promise.resolve(results[0].instructorId);
		} else {
			return Promise.reject(404);
		}
	} catch {
		return Promise.reject(500);
	}
}

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Return if the specified student is enrolled in the course
 */
exports.studentEnrolledInCourse = async function (studentID, courseID) {
	try {
		const students = await getStudentsInCourse(courseID);	
		const studentIDs = students.map( student => student.id );
		return (studentIDs.includes(studentID));
	} catch (err) {
		console.log(err)
		return Promise.reject(500);
	}
}
