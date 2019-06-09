const express    = require('express');
const morgan     = require('morgan');
const bodyParser = require('body-parser');

const api        = require('./api');

const { connectToDB } = require('./lib/mongo');


const app  = express();
const port = process.env.PORT || 8000;

/*
 * Morgan is a popular logger.
 */
app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(express.static('public'));


/*
 * All routes for the API are written in modules in the api/ directory.  The
 * top-level router lives in api/index.js.  That's what we include here, and
 * it provides all of the routes.
 */
app.use('/', api);

app.use('*', function (err, req, res, next) {
	console.error(err);
	if (err == 404) {
		res.status(404).json({
			error: "Requested resource " + req.originalUrl + " does not exist"
		});		
	} else if (err == 400) {
		res.status(400).json({
			error: "Request body is not valid"
		});
	} else if (err == 500) {
		res.status(500).json({
			error: "An error occurred. Try again later."
		});
	}


});

app.use('*', function (req, res, next) {
	res.status(404).json({
		error: "Requested resource " + req.originalUrl + " does not exist"
	});
});



connectToDB(() => {
	app.listen(port, () => {
		console.log("== Server is listening on port:", port);
	});
});


