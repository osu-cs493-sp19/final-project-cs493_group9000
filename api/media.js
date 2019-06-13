const router = require('express').Router();

exports.router = router;

const { getDownloadStreamById, 
		getSubmissionsByID 
} = require('../models/submissions');


// = = = = = = = = = = = = = = = = = = = = = = = = =

/* 
 * Download link for a submitted file
 */
router.get('/:id', async (req, res, next) => {
	try {
		const id = req.params.id;
		const submission = await getSubmissionsByID(id);

		getDownloadStreamById(id)
			.on('error', (err) => {
				if (err.code === 'ENOENT') {
					next();
				} else {
					next(err);
				}
			})
			.on('file', (file) => {
				res.attachment(submission.metadata.originalName);
				res.status(200).type(submission.metadata.contentType);
			})
			.pipe(res);
	} catch (err) {
		console.log(err);
		next(err);
	}
});