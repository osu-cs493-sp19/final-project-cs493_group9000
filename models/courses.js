const { getDBReference } = require('../lib/mongo');

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
