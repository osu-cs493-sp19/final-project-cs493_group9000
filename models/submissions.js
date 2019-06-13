const { getDBReference } = require('../lib/mongo');
const { ObjectId, GridFSBucket } = require('mongodb');
const fs = require('fs');


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

		// console.log("METADATA:", metadata);
		// console.log("FILE:", file);

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


exports.getFileInfoByID = async function (id) {
	try {
		const db = getDBReference();
		const bucket = new GridFSBucket(db, { bucketName: 'submissions' });
		if (!ObjectId.isValid(id)) {
			return null;
		} else {
			const results = await bucket.find({ _id: new ObjectId(id) })
				.toArray();
			return results[0];
		}
	} catch {
		return 500;
	}
};


exports.getDownloadStreamByFilename = function (filename) {
	const db = getDBReference();
	const bucket = new GridFSBucket(db, { bucketName: 'submissions' });
	return bucket.openDownloadStreamByName(filename);
};


exports.getDownloadStreamById = function (id) {
	const db = getDBReference();
	const bucket = new GridFSBucket(db, { bucketName: 'submissions' });
	if (!ObjectId.isValid(id)) {
		return null;
	} else {
		return bucket.openDownloadStream(new ObjectId(id));
	}
};


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


