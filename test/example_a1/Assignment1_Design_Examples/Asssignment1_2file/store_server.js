var express = require('express');

var app = express();

app.get('/invoice.html', function(req, res, next) {
    if(typeof req.query['purchase_submit'] != 'undefined') {
        console.log(Date.now() + ': Purchase made from ip ' + req.ip + ' data: ' + JSON.stringify(req.query));
    }
    next();
});

app.use(express.static('./static'));

var listener = app.listen(8080, () => { console.log('server started listening on port ' + listener.address().port) });