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
		getStudentsInCourse,
		addStudentToCourse,
		removeStudentFromCourse,
		getAssignmentsOfCourse
} = require('../models/courses');



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

// Needs testing

/*
 * Create a new course.
 */
router.post('/', async (req, res, next) => {
	try {
		if (validateAgainstSchema(req.body, CourseSchema)) {
			const course = extractValidFields(req.body, CourseSchema);
			const id = await insertNewCourse(course);
			res.status(201).json({
				"id": id,
				"links": {
					course: `/courses/${id}`
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

// Needs testing

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

// Needs testing

/*
 * Update data for a specific Course.
 */
router.patch ('/:id', async (req, res, next) => {
	try {
		const courseID = parseInt(req.params.id);
		const courseUpdate = extractValidFields(req.body, CourseSchema);
		const result = await updateCourse(courseID, courseUpdate);
		res.status(200).send();
	} catch (err) {
		next(err);
	}
});

// = = = = = = = = = = = = = = = = = = = = = = = = =

// Needs testing

/*
 * Remove a specific Course from the database.
 */
router.delete('/:id', async (req, res, next) => {
	try {
		const courseID = parseInt(req.params.id);
		const result = await deleteCourse(courseID);
		res.status(204).send();
	} catch (err) {
		next(err);
	}
});

// = = = = = = = = = = = = = = = = = = = = = = = = =

// Needs testing

/*
 * Fetch a list of the students enrolled in the Course.
 */
router.get('/:id/students', async (req, res, next) => {
	try {
		const courseID = parseInt(req.params.id);
		const students = await getStudentsInCourse(courseID);
		res.status(200).json(students);
	} catch (err) {
		next(err);
	}
});

// = = = = = = = = = = = = = = = = = = = = = = = = =

// Needs testing

/*
 * Update enrollment for a Course.
 */
router.post('/:id/students', async (req, res, next) => {
	try {
		// Students to Add
		if (req.body.add) {
			for (const toAdd of req.body.add) {
				addStudentToCourse(toAdd);
			}
		}

		// Students to Remove
		if (req.body.remove) {
			for (const toRemove of req.body.remove) {
				removeStudentFromCourse(toRemove);
			}
		}

		res.status(200).send();
	} catch (err) {
		next(err);
	}
});

// = = = = = = = = = = = = = = = = = = = = = = = = =

// Needs testing

/*
 * Fetch a CSV file containing list of the students enrolled in the Course.
 */
router.get('/:id/roster', async (req, res, next) => {
	res.status(200).send({});
	try {

	} catch (err) {
		next(err);
	}
});

// = = = = = = = = = = = = = = = = = = = = = = = = =

// Needs testing

/*
 * Fetch a list of the Assignments for the Course.
 */
router.get('/:id/assignments', async (req, res, next) => {
	try {
		const courseID = parseInt(req.params.id);
		const assignments = await getAssignmentsOfCourse(courseID);
		res.status(200).json(assignments);
	} catch (err) {
		next(err);
	}
});



