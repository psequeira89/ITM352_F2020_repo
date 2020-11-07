let express = require('express');
let myParser = require("body-parser");
let fs = require('fs');
let products = require('./public/product_data.json');
let app = express();
const PORT = 8080;

app.use(myParser.urlencoded({ extended: true }));

//checks if input is non-negative integer
//returns a string message in the first element of an array if error found
function isStrNonNegInt(str, errlog = false) {
    let errors = []; // assume no errors at first
    errors.push('Please enter'); //the first item in the array is the message prefix

    // Check if string is a number value
    if (Number(str) != str) {
        errors.push(' a number!');
        errors = [errors.join('')];
        return errlog ? errors : false;
    }

    // Check if it is non-negative
    if (str < 0) {
        errors.push(' a positive');
    }

    // Check that it is an integer
    if (parseInt(str) != str) {
        //check if error array contains an error already
        if (errors[1] == ' a positive' && errors.length > 1) {
            errors.push(', ');
        }
        else {
            errors.push(' an ');
        }
        errors.push('integer');
    }

    //add suffix to complete message
    errors.push(' number!');

    //return errors as the first index of errors.length
    if (errors.length == 2) {
        errors = [];
    }
    else {
        errors = [errors.join('')];
    }
    return errlog ? errors : (errors.length == 0);
}

//prints easily editable statement about shipping policy
function load_shipping_statement() {
    str = `
        <br>
        Shipping fees are charged by order subtotal:
        <ul>
            <li>$0 - $299.99: $2 shipping</li>
            <li>$300 - $499.99: $5 shipping</li>
            <li>$500 and greater: 1% of subtotal</li>
        </ul>
        <br>
    `;

    return str;
}

//calculates shipping fee based on subtotal
function calculate_shipping(subtotal) {

    //$0 - $299.99: $2 shipping
    if (subtotal < 300) {
        return shipping = 2;
    }

    //$300 - $499.99: $5 shipping
    else if (subtotal < 500) {
        return shipping = 5;
    }

    //$100 and greater: 1% of subtotal
    else {
        return shipping = 0.01 * subtotal;
    }
}

//calculates taxes due
function calculate_tax(tr, subtotal) {
    return tr * subtotal;
}



//process the checkout and return receipt page
//borrowed from example
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

//loads product selection and quantity forms
function load_product_list() {
    console.log("loading product list");
    str = '';
    let i = 0;

    while (i < products.length) {

        //add start div
        str += `<div class="w3-row-padding w3-padding-16 w3-center">`;

        //group by twos for layout
        for (let j = 0; j < 4; j++) {
            str += `
                <section id="product_${i}" class="w3-animate-top">
                    <div class="w3-quarter">
                        <img src="images/${products[i].image}" alt="product image" style="width:100%;max-width:250px" class="w3-opacity-min w3-hover-opacity-off w3-image">
                        <h3>${products[i].range} ${products[i].model}</h3>
                        <p>$${products[i].price}</p>

                        <label for="quantity_textbox"><span id='qty_textbox_message_${i}'>Quantity Desired:</span></label>
                        <input type="text" id="quantity_textbox" placeholder="0" name="quantity_textbox_${i}" onkeyup="checkQuantityTextbox(this.value, ${i});">
                    </div>
                </section>
            `
            if (j < 3 && i + 1 < products.length) {
                i++;
            }

            else {
                break;
            }
        }

        //add end div
        str += `</div>`

        i++
    }
    return str;
}


//shows error page when there is an error in the quantity entry
function process_error(res, errors) {
    let contents = fs.readFileSync('./views/error_page.template', 'utf8');
    res.send(eval('`' + contents + '`')); // render template string

    function report_error() {

        console.log("num errors: " + errors.length)
        str = '';

        for (error in errors) {
            str += `
                <h2 style="color:red;">${errors[error]}</h2>
            `;
        }

        return str;
    }
}


//--------------------CONTROLLER---------------------

//prints a log of all incoming requests
app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path);
    next();
});

//returns the receipt page
app.post("/process_form", function (req, res, next) {
    console.log(req.body)

    //check to make sure the post body is a valid string
    if (typeof req.body['checkout'] == 'undefined') {
        console.log('Invalid checkout');

        //if invalid, send back to products page
        next();
    }

    //set iterator and blank entry counter
    let i = 0;
    let blanks = 0;

    //set error array
    error = [];

    //iterate over each object in the post body looking for errors
    for (let [product, qty] of Object.entries(req.body)) {
        //stop the loop on the last key, the checkout
        if (product != `quantity_textbox_${i}`) break;

        //check how many entries are empty or 0, if it is all, reject
        if (qty == '' || qty <= 0) blanks++;
        if (blanks == products.length) error.push("There is nothing in your cart!");

        //check if value is valid or empty
        if (!isStrNonNegInt(qty) && qty != '') {
            //collect errors to report
            error.push(`<span style="color: grey">For ${products[i].range} ${products[i].model}:</span> ${isStrNonNegInt(qty, true)}`);
        }

        i++;
    }

    if (error.length != 0) {
        process_error(res, error);
    }
    else {
        process_quantity_form(req.body, res);
    }
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