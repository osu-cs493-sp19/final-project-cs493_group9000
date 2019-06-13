const { getDBReference } = require('../lib/mongo');
const { ObjectId, GridFSBucket } = require('mongodb');
const fs = require('fs');
const multer = require('multer');
const crypto = require('crypto');


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
			contentType: file.contentType
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
	const db = getDBReference();
	const bucket = new GridFSBucket(db, { bucketName: 'submissions' });
	if (!ObjectId.isValid(id)) {
		return null;
	} else {
		return bucket.openDownloadStream(new ObjectId(id));
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



