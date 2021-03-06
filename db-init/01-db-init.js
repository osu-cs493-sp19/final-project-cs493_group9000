// passwords in here need to be hashed

db.users.insertMany([
	{
		"id": 0,
		"name": "administratorA",
		"email": "adminA@oregonstate.edu",
		"password": "$2a$08$MWttXRDduccCPLQGHEaQdeJwiqDykoW9a3kVMhmobJ66oDyeCqCOO",
		"role": "admin"
	},
	{
		"id": 1,
		"name": "Rob Hess",
		"email": "hessro@oregonstate.edu",
		"password": "$2a$08$w6OiDosGsPdTlEbdN8Vr9Oh5xJnaCcynDNQjCTAE8y.ToUMNDtfLK",
		"role": "instructor"
	},
	{
		"id": 2,
		"name": "instructorB",
		"email": "instructorB@oregonstate.edu",
		"password": "$2a$08$y3tMt3fRtPU8iv6oCNHGIuRN476jhPmT/CFUEs9MnH8X1D9q4mI7y",
		"role": "instructor"
	},
	{
		"id": 3,
		"name": "instructorC",
		"email": "instructorC@oregonstate.edu",
		"password": "$2a$08$IesEVUs7ZHKULbnSUkKAUuUP6CM.5zHsHorCdAPfCO/CWyGczW2Li",
		"role": "instructor"
	},
	{
		"id": 4,
		"name": "studentA",
		"email": "studentA@oregonstate.edu",
		"password": "$2a$08$7rfS0iGOgl/0yg5Dur6aN./pYokiNWprGW/jdLsYaAaKRe9j2e5iO",
		"role": "student"
	},
	{
		"id": 5,
		"name": "studentB",
		"email": "studentB@oregonstate.edu",
		"password": "$2a$08$Z06toZcLf1Yn88C7JbnXSetyynFht2hgXshLxWEPMjqk/1.kSPjwu",
		"role": "student"
	},
	{
		"id": 6,
		"name": "studentC",
		"email": "studentC@oregonstate.edu",
		"password": "$2a$08$GHg/1a81nUBDfWzaLqYIsuwoYyjbFk0mEitcXCYtVzhUsPIVclM/2",
		"role": "student"
	},
	{
		"id": 7,
		"name": "studentD",
		"email": "studentD@oregonstate.edu",
		"password": "$2a$08$.OLUYV4IMW4RvmE6NmPjK.W8m1seGRcwRGZ.2vxZ1UMxtgyAZ6Oz6",
		"role": "student"
	},
	{
		"id": 8,
		"name": "studentE",
		"email": "studentE@oregonstate.edu",
		"password": "$2a$08$hMdrfzjNjkM4ukHY0jjZy.cdnunbbW3f1EYXcRIeEPeUWzoOeFTfm",
		"role": "student"
	}
]);


db.courses.insertMany([
	{
		"id": 0,
		"subject": "CS",
		"number": 493,
		"title": "Cloud Development",
		"term": "sp19",
		"instructorId": 1,
		"studentIds": [4,5,6,7,8]
	},	
	{
		"id": 1,
		"subject": "CS",
		"number": 434,
		"title": "Datamining and Machine Learning",
		"term": "sp19",
		"instructorId": 2,
		"studentIds": [4,5,6]
	},	
	{
		"id": 2,
		"subject": "CS",
		"number": 427,
		"title": "Cryptography",
		"term": "wi19",
		"instructorId": 3,
		"studentIds": [6,7,8]
	}
]);


db.assignments.insertMany([
	// Cloud Development
	{
		"id": 0,
		"courseId": 0,
		"title": "API design, Implementation, and Containerization",
		"points": 100,
		"due": "2019-04-22"
	},
	{
		"id": 1,
		"courseId": 0,
		"title": "API Data Storage",
		"points": 100,
		"due": "2019-05-06"
	},
	{
		"id": 2,
		"courseId": 0,
		"title": "API Authentication and Authorization",
		"points": 100,
		"due": "2019-05-20"
	},
	{
		"id": 3,
		"courseId": 0,
		"title": "File Uploads and Offline Work",
		"points": 100,
		"due": "2019-06-03"
	},
	{
		"id": 4,
		"courseId": 0,
		"title": "Final Project",
		"points": 100,
		"due": "2019-06-14"
	},	

	// Datamining and Machine Learning
	{
		"id": 5,
		"courseId": 1,
		"title": "HW 1",
		"points": 50,
		"due": "2019-04-14"
	},
	{
		"id": 6,
		"courseId": 1,
		"title": "HW 2",
		"points": 60,
		"due": "2019-05-03"
	},
	{
		"id": 7,
		"courseId": 1,
		"title": "HW 3",
		"points": 70,
		"due": "2019-05-21"
	},

	// Cryptography
	{
		"id": 8,
		"courseId": 2,
		"title": "Assignment 1",
		"points": 75,
		"due": "2019-06-03"
	},
	{
		"id": 9,
		"courseId": 2,
		"title": "Assignment 2",
		"points": 75,
		"due": "2019-06-10"
	},



]);


db.submissions.insertMany([
	// {	
	// 	"assignmentId": "",
	// 	"studentId": "",
	// 	"timestamp": "",
	// 	"file": ""
	// }
]);





