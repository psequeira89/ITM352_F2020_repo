let express = require('express');
let myParser = require("body-parser");
let fs = require('fs');
let products = require('./public/product_data.json');
let app = express();
const PORT = 8080;

app.use(myParser.urlencoded({ extended: true }));

//checks if input is non-negative integer
function isStrNonNegInt(str, errlog = false) {
    let errors = []; // assume no errors at first
    if (Number(str) != str) {
        errors.push('Not a number!'); // Check if string is a number value
        return errlog ? errors : (errors.length == 0);
    }
    if (str < 0) errors.push('Negative value!'); // Check if it is non-negative
    if (parseInt(str) != str) errors.push('Not an integer!'); // Check that it is an integer
    return errlog ? errors : (errors.length == 0);
}

//prints easily editable statement about shipping policy
function load_shipping_statement(){
    str = `
        <br>
        Shipping fees are charged by order subtotal:
        <ul>
            <li>$0 - $49.99: $2 shipping</li>
            <li>$50 - $99.99: $5 shipping</li>
            <li>$100 and greater: 5% of subtotal</li>
        </ul>
        <br>
    `;

    return str;
}

//calculates shipping fee based on subtotal
function calculate_shipping(subtotal){

    //$0 - $49.99: $2 shipping
    if (subtotal <= 50) {
        return shipping = 2;
    }

    //$50 - $99.99: $5 shipping
    else if (subtotal <= 100) {
        return shipping = 5;
    }

    //$100 and greater: 5% of subtotal
    else {
        return shipping = 0.05 * subtotal;
    }
}

//calculates taxes due
function calculate_tax(tr, subtotal){
    return tr * subtotal;
}



//process the checkout and return receipt page
function process_quantity_form(POST, res) {
    let contents = fs.readFileSync('./views/display_receipt.template', 'utf8');
    res.send(eval('`' + contents + '`')); // render template string

    //display table rows
    function display_invoice_table_rows() {
        subtotal = 0;
        str = '';

        //add product rows
        for (product in products) {
            qty = 0;

            //check for empty values
            if (typeof POST[`quantity_textbox_${product}`] != 'undefined') {
                qty = POST[`quantity_textbox_${product}`];
            }

            if (qty > 0) {
                // product row
                extended_price = qty * products[product].price
                subtotal += extended_price;
                str += (`
                    <tr>
                        <td width="43%"><span id="product_range">${products[product].range}</span> ${products[product].model}</td>
                        <td align="center" width="11%">${qty}</td>
                        <td width="13%">\$${products[product].price}</td>
                        <td width="54%">\$${extended_price}</td>
                    </tr>
                `);
            }
        }

        // Compute tax
        tax_rate = 0.0575;
        tax = calculate_tax(tax_rate, subtotal);
        
        // Compute shipping
        shipping = calculate_shipping(subtotal);

        // Compute grand total
        total = subtotal + tax + shipping;

        return str;
    }
}

//loads product selection and quantity forms for e
function load_product_list() {
    console.log("loading product list");
    str = '';
    for (product in products) {

        str += `
            <section id="product_${product}">
                <div class="product_name"><h2>${products[product].range} ${products[product].model}</h2></div>
                <div class="product_price"><h3>$${products[product].price}</h3></div>
                <div class="product_image"><img src="images/${products[product].image}" alt="image of ${products[product].range} ${products[product].model}" width="100px"></div>

                <label for="quantity_textbox"><span id='qty_textbox_message_${product}'>Quantity Desired:</span></label>
                <input type="text" id="quantity_textbox" placeholder="0" name="quantity_textbox_${product}" onkeyup="checkQuantityTextbox(this.value, ${product});">
                
            </section>
        `;
    }
    return str;
}


//--------------------CONTROLLER---------------------

//prints a log of all incoming requests
app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path);
    next();
});

//returns the receipt page
app.post("/process_form", function (req, res, next) {

    //check to make sure the post body is a valid string
    if (typeof req.body['checkout'] == 'undefined') {
        console.log('Invalid purchase');

        //if invalid, send back to products page
        next();
    }

    process_quantity_form(req.body, res);
});

//load the products page
app.get('/products', (req, res) => {
    let contents = fs.readFileSync('./views/product_page.template', 'utf8');
    res.send(eval('`' + contents + '`')); // render template string


});

//load the index page
app.get('/', (req, res) => {
    res.redirect('index.html');
});

//--------------------------------------------------

app.use(express.static('./public'));

app.listen(PORT, () => console.log(`listening on port ${PORT}`));