const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// errors
const routesErrors = require('./errors/http-errors');

// routes
const resourcesRoutes = require('./routes/resources-routes');
const chaptersRoutes = require('./routes/chapters-routes');
const usersRoutes = require('./routes/users-routes');

// initialize express framework
const app = express();

// returns middleware that only parses json
app.use(bodyParser.json());

// initialize base routes
app.use('/api/resources', resourcesRoutes); // => localhost:PORT/api/resources/...
app.use('/api/chapters', chaptersRoutes); // => localhost:PORT/api/chapters/...
app.use('/api/users', usersRoutes); // => localhost:PORT/api/users/...

// not found route error
app.use((req, res, next) => {
    throw routesErrors.notFoundError('Could not find this route');
});

// internal server error
app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({message: error.message || 'An unknown error occurred!'});
});

// connection to database
mongoose
    .connect(
        "mongodb+srv://abdullahdeliogullari:147258DsA@underlinedcluster-qwnai.mongodb.net/underlinedb?retryWrites=true&w=majority",
        {
            useCreateIndex: true,
            useUnifiedTopology: true,
            useNewUrlParser: true
        })
    .then(() => {
        app.listen(5000);
    })
    .catch(err => {
        console.log(err);
    });
