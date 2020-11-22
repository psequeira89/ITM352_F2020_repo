/*
Assignment 2 for ITM 352

Author: Philip Sequeira (paseque@hawaii.edu)
Date: November 2020
Filename: server.js
Description: 
    'server.js' is the Express server for the store 'CPU City'.
*/

let express = require('express');
let myParser = require("body-parser");
let fs = require('fs');
let products = require('./product_data.json');
let user_data_filename = 'user_data.json';
let users_reg_data = {};
let app = express();
const PORT = 8080;
let newReg = false;
let newRegName = '';

//global error array
let all_errors = [];

//object holding validation regex values
let validator = {
    "fullname": /[a-zA-Z\ ]{1,30}/,
    "username": /[a-zA-Z0-9]{4,10}/,
    "password": /.{6,}/,
    "email": /^[a-zA-Z0-9._]+@[a-zA-Z0-9.]+\.[a-zA-Z]{2,3}$/
};

app.use(myParser.urlencoded({ extended: true }));

//set array of active users, index 0 is a 'guest' user for users not logged in
let active_users = [
    {
        "username": "guest",
        "password": "",
        "fullname": "Guest",
        "email": "",
        "hold_order": { "quantity_textbox_0": -1 }
    }
];

//stores the currently selected user index, initializes to 0 (not logged in)
let current_user = 0;

//checks if user data file exists and parses to JSON
if (fs.existsSync(user_data_filename)) {
    let data = fs.readFileSync(user_data_filename, 'utf-8');
    users_reg_data = JSON.parse(data);
} else {
    //display error when data file not found
    let err_msg = `------------ERROR-------------\nThe file: \'${user_data_filename}\' could not be found.\nCheck the file path of ${user_data_filename}\n------------------------------`;
    console.log(err_msg);
}

//checks if input is non-negative integer
//returns a string message in the first element of an array if error found by building the message
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
function process_quantity_form(POST, res) {
    let contents = fs.readFileSync('./views/display_receipt.template', 'utf8');

    res.send(eval('`' + contents + '`')); // render template string


    //display table rows
    //adapted from example
    function display_recipt_items() {
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

        //reset the global temp order
        hold_order = {};

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

        //group by fours for layout
        for (let j = 0; j < 4; j++) {
            str += `
                <section id="product_${i}" class="w3-animate-top">
                    <div class="w3-quarter">
                        <img src="images/${products[i].image}" alt="product image" style="width:100%;max-width:250px" class="w3-opacity-min w3-hover-opacity-off w3-image">
                        <h3>${products[i].range} ${products[i].model}</h3>
                        <p>$${products[i].price}</p>

                        <label for="quantity_textbox"><span id='qty_textbox_message_${i}'>Quantity Desired:</span></label>
                        <input type="text" id="quantity_textbox_${i}" placeholder="0" name="quantity_textbox_${i}" onkeyup="checkQuantityTextbox(this.value, ${i});">
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

//returns errors for modals
function report_error() {
    str = '';

    if (all_errors.length > 0){

        //creates the modal with id 'error'
        str += `
            <div class="w3-container">
                <div id="error" class="w3-modal">
                    <div class="w3-modal-content w3-animate-top w3-card-4">
                        <header class="w3-container w3-red"> 
                            <span onclick="document.getElementById('error').style.display='none'" 
                            class="w3-button w3-display-topright" style="font-size:2em">&times;</span>
                            <h2>Oh no!</h2>
                        </header>
                        <div class="w3-container">
                            <br>
                            <h3>Something's not right here...</h3>
                            `;

                            //include all errors
                            for (error in all_errors) {
                                str += `
                                    <h4 style="color:red;">${all_errors[error]}</h4>
                                `;
                            }

                            str += `
                            <br>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    //clear global error array
    all_errors = [];

    return str;
}

//shows error page when there is an error in the quantity entry
function process_error(req, res, errors) {

    //update global error array
    all_errors = errors;

    //send back to last page
    res.redirect('back');
}

//returns personalization by showing logged in user's name or login button
function load_top_right() {
    let str = '';

    //if not logged in, show link to login link in 
    if (active_users.length === 1) {
        str += "<a href='/login' style='text-decoration: none;font-size:0.8em'><em>Login</em></a>";
        return str;
    } else {
        str += `Welcome, ${get_user_name()}!`;
        return str;
    }
}

//returns user's name
function get_user_name() {
    return active_users[current_user]['fullname'];
}

//process registration
function process_reg(req, res) {
    const POST = req.body;

    //setup error collector
    let errors = [];

    //store requested username and password to local object
    let req_user = {};
    req_user.username = POST['reg_username'];
    req_user.password = POST['reg_password'];
    req_user.password2 = POST['reg_repeat_password'];
    req_user.fullname = POST['reg_fullname'];
    req_user.email = POST['reg_email'];

    //---validate input---

    //check for bad username
    // username: 4-10 characters, only letters and numbers, case insensitive, must be unique
    if (!validator.username.test(req.username)) {
        errors.push('Username must be 4-10 characters using only letters and numbers');
    }

    //check for bad password
    // password: >= 6 chars, all chars valid, case sensitive
    if (!validator.password.test(req_user.password)) {
        errors.push('Password must be at least 6 characters');
    }

    //check for bad fullname
    // fullname: <= 30 chars, only letters
    if (!validator.fullname.test(req_user.fullname)) {
        errors.push('Name must be less than 30 characters and use only letters');
    }

    // email address: format is x@y.z, case sensitive
    //     x: only letters, numbers and '_' and '.'
    //     y: only letters, numbers, and '.'
    //     z: 2-3 letters
    //check for bad email
    if (!validator.email.test(req_user.email)){
        errors.push('Please enter valid email address');
    }

    //check if passwords match
    if (req_user.password != req_user.password2) {
        errors.push('Passwords do not match');
    }

    //check if username is available
    //iterates through user_data.json and checks req username for availability    
    for (user in users_reg_data) {
        if (users_reg_data[user]['username'].toLowerCase() === (req_user.username.toLowerCase())) {
            errors.push('Username taken');
            break;
        }
    }

    if (errors.length > 0) {
        process_error(req, res, errors);
    }

    //if successful, add data and return to login
    else {
        users_reg_data.push(req_user);
        fs.writeFileSync(user_data_filename, JSON.stringify(users_reg_data));

        // set display registration success message flag to true
        newReg = true;

        //update temp fullname to be the newly registered user's name for greeting
        newRegName = req_user.fullname;

        res.redirect('/login');
    }
}

///process login
function process_login(req, res) {
    const POST = req.body;

    //set bad username and password flags
    let bad_username = true;
    let bad_password = true;

    //collect errors in an array
    let errors = [];

    //stores the currently selected user index
    let this_user = 0;

    //store requested username and password to local object
    let req_user = {};
    req_user.username = POST['login_username'];
    req_user.password = POST['login_password'];

    //iterates through user_data.json and checks req username/password 
    for (user in users_reg_data) {

        if (users_reg_data[user]['username'].toLowerCase() === (req_user.username.toLowerCase())) {
            bad_username = false;

            //if the user matches then check the password
            if (users_reg_data[user].password == req_user.password) {
                bad_password = false;

                //store the found user index
                this_user = user;
            }
            break;
        }
    }

    if (bad_username === true) {
        errors.push('Username not found');
    }

    if (bad_password === true) {
        errors.push('Password is invalid');
    }

    //if both the username and password are ok, login
    if (errors.length === 0) {

        let redirect_to_receipt = false;

        //check if guest and there is an order pending
        if (current_user === 0 && active_users[current_user].hold_order.quantity_textbox_0 != -1) {
            redirect_to_receipt = true;
        }

        //logs out current user
        update_current_user_index(false);

        //add the current user to the pool of currently logged in users
        active_users.push(users_reg_data[this_user]);
        console.log(`User: ${users_reg_data[this_user].username} has logged in.`);

        //set the current user index for a login
        update_current_user_index(true);

        //if user is logging in with a purchase pending, process the order
        if (redirect_to_receipt) {
            process_quantity_form(active_users[current_user].hold_order, res);
        }

        //if user is logging in without a purchase pending, take them to the store
        else {
            res.redirect('/products');
        }
    }

    //if username or password is not correct, respond with errora
    else {
        process_error(req, res, errors);
    }
}

//updates the current_user index
//if login is true, processes a login, else a logout
function update_current_user_index(login) {

    //true indicates a login, false, logout
    if (login) {

        //transfers any held orders to new login
        let temp_order = {};
        temp_order = active_users[current_user].hold_order;

        //remove hold order from logged out user if not guest
        if (current_user != 0) {
            delete active_users[current_user].hold_order;
        }

        //increments current user index
        current_user++;

        active_users[current_user].hold_order = temp_order;

    } else {
        let logout = {};

        //logs out current user unless it is the default user
        if (active_users.length > 1) {
            logout = active_users.pop();
            console.log(`User: ${logout.username} has logged out`);
            current_user--;
        } else {
            console.log("Tried to log out, but no users logged in");
        }
    }
}

//validate checkout form and either process or redirect to login
function validate_checkout_form(req,res){
    const POST = req.body;

    //set iterator and blank entry counter
    let i = 0;
    let blanks = 0;

    //set error array
    let error = [];

    //iterate over each object in the post body looking for errors
    for (let [product, qty] of Object.entries(POST)) {
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

    //show errors if there are any
    if (error.length != 0) {
        process_error(req, res, error);
    }

    //check if logged in, then process accordingly
    else {

        //if not logged in, save the current order to global temp object
        if (current_user === 0) {
            active_users[current_user].hold_order = POST;

            //ask to login
            res.redirect('/login');
        }

        //if logged in, process order
        else {
            process_quantity_form(POST, res);
        }
    }
}

//returns registration success message in a modal
function display_new_reg_welcome(){
    str = '';
    if (newReg){
        str += `
            <div class="w3-container">
                <div id="reg-success" class="w3-modal">
                    <div class="w3-modal-content w3-animate-top w3-card-4">
                        <header class="w3-container w3-blue"> 
                            <span onclick="document.getElementById('reg-success').style.display='none'" 
                            class="w3-button w3-display-topright" style="font-size:2em">&times;</span>
                            <h2>Welcome, ${newRegName}!</h2>
                        </header>
                        <div class="w3-container">
                            <br>
                            <h3>You're all signed up!</h3>
                            <h3>Please login to continue.</h3>
                            <br>
                        </div>
                    </div>
                </div>
            </div>
        `;

        //reset newReg variables
        newRegName = '';
        newReg = false;
    }
    return str;
}

//###############################CONTROLLER###############################

//prints a log of all incoming requests
app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path);
    next();
});

//checks for valid input and returns the receipt page if POST data is valid, or the error form if there is a problem
app.post("/process_form", function (req, res, next) {
    const POST = req.body;

    //check to make sure the post body is a valid string
    if (typeof POST['checkout'] == 'undefined') {
        console.log('Invalid checkout');

        //if invalid, send back to products page
        next();
    }

    //validate checkout form and either process or redirect to login
    validate_checkout_form(req,res);
});

///process registration
app.post('/process_reg', (req, res) => {
    process_reg(req, res);
});

///process login
app.post('/process_login', (req, res) => {
    process_login(req, res);
});

//load the products page
app.get('/products', (req, res) => {
    let contents = fs.readFileSync('./views/product_page.template', 'utf8');
    res.send(eval('`' + contents + '`')); // render template string
});

//load the login page
app.get('/login', (req, res) => {
    let contents = fs.readFileSync('./views/login.template', 'utf8');
    res.send(eval('`' + contents + '`')); // render template string
});

//load the index page
app.get('/', (req, res) => {
    res.redirect('index.html');
});

//########################################################################

app.use(express.static('./public'));

app.listen(PORT, () => console.log(`listening on port ${PORT}`));