const { getDBReference } = require('../lib/mongo');

/*
 * Schema for a User.
 */
const UserSchema = {
	name:		{ required: true },
	email:		{ required: true },
	password:	{ required: true },
	role:		{ required: true }
};
exports.UserSchema = UserSchema;
