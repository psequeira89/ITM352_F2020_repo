var express = require('express');
var myParser = require("body-parser");
var products = require('./static/products.json');

var app = express();

app.use(myParser.urlencoded({ extended: true }));

app.post('/process_purchase', function (req, res, next) {
    console.log(Date.now() + ': Purchase made from ip ' + req.ip + ' data: ' + JSON.stringify(req.body));
    invoice_data = invoice(req.body);
    res.json(invoice_data);
    next();
});

app.use(express.static('./static'));

var listener = app.listen(8080, () => { console.log('server started listening on port ' + listener.address().port); });

function invoice(quantities) {
    subtotal = 0;
    for (i = 0; i < products.length; i++) {
        a_qty = quantities[`quantity${i}`];
        if (a_qty > 0) {
            // add to subtotal
            subtotal += a_qty * products[i].price;
        }
    }
    // Compute tax
    var tax_rate = 0.0575;
    var tax = tax_rate * subtotal;

    // Compute shipping
    if (subtotal <= 50) {
        shipping = 2;
    }
    else if (subtotal <= 100) {
        shipping = 5;
    }
    else {
        shipping = 0.05 * subtotal; // 5% of subtotal
    }

    // Compute grand total
    var total = subtotal + tax + shipping;

    return {
        "quantities": quantities,
        "total": total, 
        "subtotal": subtotal, 
        "tax_rate": tax_rate, 
        "tax": tax, 
        "shipping": shipping
        };
}