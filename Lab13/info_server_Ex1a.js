var express = require('express');
var app = express();



app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path);
    next();
});

app.get('/test', (req,res)=>{
    res.send("test");
});

app.listen(8080, () => console.log(`listening on port 8080`)); // note the use of an anonymous function here
