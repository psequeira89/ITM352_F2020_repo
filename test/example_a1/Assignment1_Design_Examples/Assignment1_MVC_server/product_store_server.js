var express = require('express');
var myParser = require("body-parser");
var fs = require('fs');
var products = require("./products.json");

var app = express();

app.use(myParser.urlencoded({ extended: true }));

app.post("/process_invoice", function (request, response, next) {
    let POST = request.body;
    if(typeof POST['purchase_submit'] == 'undefined') {
        console.log('No purchase form data');
        next();
    } 

    console.log(Date.now() + ': Purchase made from ip ' + request.ip + ' data: ' + JSON.stringify(POST));

    var contents = fs.readFileSync('./views/invoice.template', 'utf8');
    response.send(eval('`' + contents + '`')); // render template string

    function display_invoice_table_rows() {
        subtotal = 0;
        str = '';
        for (i = 0; i < products.length; i++) {
            a_qty = 0;
            if(typeof POST[`quantity${i}`] != 'undefined') {
                a_qty = POST[`quantity${i}`];
            }
            if (a_qty > 0) {
                // product row
                extended_price =a_qty * products[i].price
                subtotal += extended_price;
                str += (`
      <tr>
        <td width="43%">${products[i].brand}</td>
        <td align="center" width="11%">${a_qty}</td>
        <td width="13%">\$${products[i].price}</td>
        <td width="54%">\$${extended_price}</td>
      </tr>
      `);
            }
        }
        // Compute tax
        tax_rate = 0.0575;
        tax = tax_rate * subtotal;

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
        total = subtotal + tax + shipping;
        
        return str;
    }

});

app.get("/store", function (request, response) {
    var contents = fs.readFileSync('./views/display_products.template', 'utf8');
    response.send(eval('`' + contents + '`')); // render template string

    function display_products() {
        str = '';
        for (i = 0; i < products.length; i++) {
            str += `
                <section class="item">
                    <h2>${products[i].brand}</h2>
                    <p>$${products[i].price}</p>
                    <label id="quantity${i}_label"}">Quantity</label>
                    <input type="text" placeholder="0" name="quantity${i}" onkeyup="checkQuantityTextbox(this);">
                    <img src="${products[i].image}">
                </section>
            `;
        }
        return str;
    }
});

app.use(express.static('./static'));

var listener = app.listen(8080, () => { console.log('server started listening on port ' + listener.address().port) });