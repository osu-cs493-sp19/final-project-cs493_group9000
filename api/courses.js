const router = require('express').Router();

exports.router = router;

const { validateAgainstSchema } = require('../lib/validation');
const { CourseSchema,
		getCourses,
		insertNewCourse,
		getCourseByID,
		updateCourse,
		deleteCourse,
		getStudentsInCourse,
		addStudentToCouse,
		getAssignmentsOfCourse
} = require('../models/courses');



/*
 * Fetch the list of all Courses.
 */
router.get('/', async (req, res, next) => {
	res.status(200).send({});
});

/*
 * Create a new course.
 */
router.post('/', async (req, res, next) => {
	res.status(200).send({});
});

/*
 * Fetch data about a specific Course.
 */
router.get('/:id', async (req, res, next) => {
	res.status(200).send({});
});

/*
 * Update data for a specific Course.
 */
router.patch('/:id', async (req, res, next) => {
	res.status(201).send({});
});

/*
 * Remove a specific Course from the database.
 */
router.delete('/:id', async (req, res, next) => {
	res.status(200).send({});
});

/*
 * Fetch a list of the students enrolled in the Course.
 */
router.get('/:id/students', async (req, res, next) => {
	res.status(200).send({});
});

/*
 * Update enrollment for a Course.
 */
router.post('/:id/students', async (req, res, next) => {
	res.status(201).send({});
});

/*
 * Fetch a CSV file containing list of the students enrolled in the Course.
 */
router.get('/:id/roster', async (req, res, next) => {
	res.status(200).send({});
});

/*
 * Fetch a list of the Assignments for the Course.
 */
router.get('/:id/assignments', async (req, res, next) => {
	res.status(200).send({});
});



