db.users.insertMany([
	{
		"name": "administratorA",
		"email": "adminA@oregonstate.edu",
		"password": "hunter2",
		"role": "admin"
	},
	{
		"name": "Rob Hess",
		"email": "hessro@oregonstate.edu",
		"password": "hunter2",
		"role": "instructor"
	},
	{
		"name": "instructorB",
		"email": "instructorB@oregonstate.edu",
		"password": "hunter2",
		"role": "instructor"
	},
	{
		"name": "instructorC",
		"email": "instructorC@oregonstate.edu",
		"password": "hunter2",
		"role": "instructor"
	},
	{
		"name": "studentA",
		"email": "studentA@oregonstate.edu",
		"password": "hunter2",
		"role": "student"
	},
	{
		"name": "studentB",
		"email": "studentB@oregonstate.edu",
		"password": "hunter2",
		"role": "student"
	},
	{
		"name": "studentC",
		"email": "studentC@oregonstate.edu",
		"password": "hunter2",
		"role": "student"
	},
	{
		"name": "studentD",
		"email": "studentD@oregonstate.edu",
		"password": "hunter2",
		"role": "student"
	},
	{
		"name": "studentE",
		"email": "studentE@oregonstate.edu",
		"password": "hunter2",
		"role": "student"
	}
]);


db.courses.insertMany([
	{
		"subject": "CS",
		"number": 493,
		"title": "Cloud Development",
		"term": "sp19",
		"instructorId": 1,
		"studentIds": [4,5,6,7,8]
	}
]);


db.assignments.insertMany([
	{
		"courseId": 0,
		"title": "API design, Implementation, and Containerization",
		"points": 100,
		"due": "2019-04-22"
	},
	{
		"courseId": 0,
		"title": "API Data Storage",
		"points": 100,
		"due": "2019-05-06"
	},
	{
		"courseId": 0,
		"title": "API Authentication and Authorization",
		"points": 100,
		"due": "2019-05-20"
	},
	{
		"courseId": 0,
		"title": "File Uploads and Offline Work",
		"points": 100,
		"due": "2019-06-03"
	},
	{
		"courseId": 0,
		"title": "Final Project",
		"points": 100,
		"due": "2019-06-14"
	},
]);


// db.submissions.insertMany([
// 	{	
// 		"assignmentId": "",
// 		"studentId": "",
// 		"timestamp": "",
// 		"file": ""
// 	}
// ]);





