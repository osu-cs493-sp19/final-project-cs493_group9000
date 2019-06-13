const { getDBReference } = require('../lib/mongo');
const { ObjectId, GridFSBucket } = require('mongodb');
const fs = require('fs');
const multer = require('multer');
const crypto = require('crypto');


/*
 * Submissions pagination page size
 */ 
const pageSize = 4;



const fileTypes = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'application/pdf': 'pdf',
	'text/plain': 'txt'
};
exports.fileTypes = fileTypes;


const upload = multer({
	storage: multer.diskStorage({
		destination: `${__dirname}/uploads`,
		filename: (req, file, callback) => {
			const basename = crypto.pseudoRandomBytes(16).toString('hex');
			const extension = fileTypes[file.mimetype];
			callback(null, `${basename}.${extension}`);
		}
	}),
	fileFilter: (req, file, callback) => {
		callback(null, !!fileTypes[file.mimetype]);
	}
});
exports.upload = upload;



// = = = = = = = = = = = = = = = = = = = = = = = = =

// /*
//  * Get single submission by ID
//  */
exports.getSubmissionsByID = async function (submissionID) {
	try {
		const db = getDBReference();
		const bucket = new GridFSBucket(db, { bucketName: 'submissions' });
		if (!ObjectId.isValid(submissionID)) {
			Promise.reject(404);
		} else {
			const results = await bucket.find({ _id: new ObjectId(submissionID) }).toArray();
			return Promise.resolve(results[0]);
		}	
	} catch {
		return Promise.reject(500);
	}
}

// = = = = = = = = = = = = = = = = = = = = = = = = =

/*
 * Get list of assignments for an assignment
 */
exports.getSubmissionsToAssignmentPage = async function (assignmentID, page) {
	try {
		const db = getDBReference();
		const bucket = new GridFSBucket(db, { bucketName: 'submissions' });

		var results = await bucket
			.find({ "metadata.assignmentId": assignmentID })
			.project({ 
				_id: 1,
				"metadata.studentId": 1,
				"metadata.assignmentId": 1,
				"metadata.timestamp": 1,
				filename: 1
			})
			.toArray();

		results = results.map( (result) => { return { 
			_id: result._id, 
			...result.metadata, 
			filename: result.filename 
		} } );

		if (results) {
			const count = results.length;
			const lastPage = Math.ceil(count / pageSize);
			page = (page > lastPage) ? lastPage : page;
			page = (page < 1) ? 1 : page;
			const offset = (page - 1) * pageSize;

			return Promise.resolve({
				submissions: results.slice(offset, offset+pageSize),
				pageNumber: page,
				totalPages: lastPage,
				pageSize: pageSize,
				count: count
			});
		} else {
			return Promise.reject(404);
		}

	} catch (err) {
		console.log(err);
		return Promise.reject(500);
	}
}

// = = = = = = = = = = = = = = = = = = = = = = = = =

/* 
 * Add a submitted file to GridFS
 */
exports.saveSubmissionFile = function (file) {
	return new Promise((resolve, reject) => {
		const db = getDBReference();
		const bucket = new GridFSBucket(db, { bucketName: 'submissions' });

		const metadata = {
			studentId: file.studentId,
			assignmentId: file.assignmentId,
			timestamp: file.timestamp,
			contentType: file.contentType,
			originalName: file.originalName
		};

		const uploadStream = bucket.openUploadStream(
			file.filename,
			{ metadata: metadata }
		);

		fs.createReadStream(file.path)
			.pipe(uploadStream)
			.on('error', (err) => {
				reject(err);
			})
			.on('finish', (result) => {
				resolve(result._id);
			});
	});
};

// = = = = = = = = = = = = = = = = = = = = = = = = =

/* 
 * Get download stream of a submission by its ID
 */
exports.getDownloadStreamById = function (id) {
	try {
		const db = getDBReference();
		const bucket = new GridFSBucket(db, { bucketName: 'submissions' });
		if (!ObjectId.isValid(id)) {
			return null;
		} else {
			return bucket.openDownloadStream(new ObjectId(id));
		}
	} catch {
		next(500);
	}
};

// = = = = = = = = = = = = = = = = = = = = = = = = =

/* 
 * Remove a file that was uploaded before adding to GridFS
 */
exports.removeUploadedFile = function (file) {
	return new Promise((resolve, reject) => {
		fs.unlink(file.path, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
}



// exports.getDownloadStreamByFilename = function (filename) {
// 	const db = getDBReference();
// 	const bucket = new GridFSBucket(db, { bucketName: 'submissions' });
// 	return bucket.openDownloadStreamByName(filename);
// };



