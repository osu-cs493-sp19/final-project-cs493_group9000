const router = require('express').Router();

exports.router = router;

const { getDownloadStreamById } = require('../models/submissions');


// = = = = = = = = = = = = = = = = = = = = = = = = =

/* 
 * Download link for a submitted file
 */
router.get('/:id', async (req, res, next) => {
	try {
		const id = req.params.id;
		
		getDownloadStreamById(id)
			.on('error', (err) => {
				if (err.code === 'ENOENT') {
					next();
				} else {
					next(err);
				}
			})
			.on('file', (file) => {
				res.status(200).type('image/jpeg');
			})
			.pipe(res);
	} catch (err) {
		next(err);
	}
});