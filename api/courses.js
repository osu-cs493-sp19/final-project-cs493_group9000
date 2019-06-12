const router = require('express').Router();

exports.router = router;

const { validateAgainstSchema,
		extractValidFields
} = require('../lib/validation');

const { CourseSchema,
		getCourses,
		getCoursesPage,
		insertNewCourse,
		getCourseByID,
		updateCourse,
		deleteCourse,
		getStudentIDsInCourse,
		addStudentsToCourse,
		removeStudentsFromCourse,
		getStudentsInCourse,
		getAssignmentsOfCourse,
		getCourseInstructorID
} = require('../models/courses');

const { validateJWT,
		getRole,
		requireIsAdmin
} = require('../lib/auth');

const { Parser } = require('json2csv');



// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Fetch the list of all Courses.
 */
router.get('/', async (req, res, next) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const results = await getCoursesPage(page);

		/*
		 * Generate HATEOAS links for surrounding pages.
		 */
		let links = {};
		if (results.pageNumber < results.totalPages) {
			links.nextPage = `/courses?page=${results.pageNumber + 1}`;
			links.lastPage = `/courses?page=${results.totalPages}`;
		}
		if (results.pageNumber > 1) {
			links.prevPage = `/courses?page=${results.pageNumber - 1}`;
			links.firstPage = '/courses?page=1';
		}

		res.status(200).send({ ...results, links });
	} catch (err) {
		next(err);
	}
});

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Create a new course.
 */
router.post('/', validateJWT, getRole, requireIsAdmin, async (req, res, next) => {
// router.post('/', validateJWT, getRole, async (req, res, next) => {
	try {
		if (validateAgainstSchema(req.body, CourseSchema)) {
			const course = extractValidFields(req.body, CourseSchema);
			const result = await insertNewCourse(course);
			res.status(201).json({
				"id": result.insertedID,
				"links": {
					course: `/courses/${result.insertedID}`
				}
			});
		} else {
			next(400);
		}
	} catch (err) {
		next(err);
	}
});

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Fetch data about a specific Course.
 */
router.get('/:id', async (req, res, next) => {
	try {
		const courseID = parseInt(req.params.id);
		const course = await getCourseByID(courseID);
		res.status(200).json(course);
	} catch (err) {
		next(err);
	}
});

// = = = = = = = = = = = = = = = = = = = = = = = = =

// Works unless clearing fields

/*
 * Update data for a specific Course.
 */
router.patch ('/:id', validateJWT, getRole, async (req, res, next) => {
	try {
		const courseID = parseInt(req.params.id);
		const instructorID = await getCourseInstructorID(courseID);
		if ((req.tokenUserRole === 'admin') || (req.tokenUserID === instructorID)) {
			const courseUpdate = extractValidFields(req.body, CourseSchema);
			const result = await updateCourse(courseID, courseUpdate);
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
 * Remove a specific Course from the database.
 */
router.delete('/:id', validateJWT, getRole, requireIsAdmin, async (req, res, next) => {
	try {
		const courseID = parseInt(req.params.id);
		const result = await deleteCourse(courseID);
		res.status(204).send();
	} catch (err) {
		next(err);
	}
});

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Fetch a list of the students enrolled in the Course.
 */
router.get('/:id/students', validateJWT, getRole, async (req, res, next) => {
	try {
		const courseID = parseInt(req.params.id);
		const instructorID = await getCourseInstructorID(courseID);
		if ((req.tokenUserRole === 'admin') || (req.tokenUserID === instructorID)) {
			const students = await getStudentIDsInCourse(courseID);
			res.status(200).json({ "students": students });
		} else {
			next(403);
		}
	} catch (err) {
		next(err);
	}
});

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Update enrollment for a Course.
 */
router.post('/:id/students', validateJWT, getRole, async (req, res, next) => {
	try {
		const courseID = parseInt(req.params.id);
		const instructorID = await getCourseInstructorID(courseID);
		if ((req.tokenUserRole === 'admin') || (req.tokenUserID === instructorID)) {

			// Students to Add
			if (req.body.add) {
				let result = await addStudentsToCourse(courseID, req.body.add);
				if (result != courseID) {
					next(500);
				}
			}

			// Students to Remove
			if (req.body.remove) {
				let result = await removeStudentsFromCourse(courseID, req.body.remove);
				if (result != courseID) {
					next(500);
				}
			}

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
 * Fetch a CSV file containing list of the students enrolled in the Course.
 */
router.get('/:id/roster', validateJWT, getRole, async (req, res, next) => {
	try {
		const courseID = parseInt(req.params.id);
		const instructorID = await getCourseInstructorID(courseID);
		if ((req.tokenUserRole === 'admin') || (req.tokenUserID === instructorID)) {

			const students = await getStudentsInCourse(courseID);

			// Generate CSV
			const fields = ['id', 'name', 'email'];
			const jsonParser = new Parser({fields});
			const csv = jsonParser.parse(students);

			res.attachment('course-'+courseID+'-students.csv');
			res.status(200).send(csv);
		} else {
			next(403);
		}
	} catch (err) {
		next(err);
	}
});

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Fetch a list of the Assignments for the Course.
 */
router.get('/:id/assignments', async (req, res, next) => {
	try {
		const courseID = parseInt(req.params.id);
		const assignmentsList = await getAssignmentsOfCourse(courseID);
		res.status(200).json({ "assignments": assignmentsList });
	} catch (err) {
		next(err);
	}
});



