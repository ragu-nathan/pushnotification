const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

require('./model/subscribers_model');

const index = require('./router');

const push = require('./router/push');

const subscribe = require('./router/subscriber');

const keys = require('./config/keys');

mongoose.Promise = global.Promise;

mongoose.connect(keys.mongoURI, {
        useMongoClient: true
    })
    .then(()=> console.log('MongoDB connected'))
    .catch(err => console.log(err));

const app = express();
app.set('trust proxy', true);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extented: true}));

app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
})

// use Routes
app.use('/', index);
app.use('/subscribe', subscribe);
app.use('/push', push);

app.use((req, res, next) => {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if(app.get('env') === 'development') {
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});