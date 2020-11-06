var express = require('express');
var app = express();
var myParser = require("body-parser");

app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path);
    next();
});

app.use(myParser.urlencoded({ extended: true }));

app.post("/process_form", function (request, response) {
    let POST = request.body;
    let purchase_qty = POST['quantity_textbox'];

    function isStrNonNegInt(str, errlog = false){
        var errors = []; // assume no errors at first
        if(Number(str) != str) {
            errors.push('Not a number!'); // Check if string is a number value
            return errlog ? errors : (errors.length == 0);
        }
        if(str < 0) errors.push('Negative value!'); // Check if it is non-negative
        if(parseInt(str) != str) errors.push('Not an integer!'); // Check that it is an integer
        return errlog ? errors : (errors.length == 0);
    }

   if (typeof purchase_qty != 'undefined'){
        if (isStrNonNegInt(purchase_qty)){
            response.send(`Thank you for ordering: ${purchase_qty}`);
        }
        else {
            response.send(`${purchase_qty} is not a quantity! Press the back button and try again.`);
        }
    }
});


app.get('/test', (req,res)=>{
    res.send("test");
});

app.use(express.static('./public'));

app.listen(8080, () => console.log(`listening on port 8080`)); // note the use of an anonymous function here
