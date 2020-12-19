/*
Assignment 3 for ITM 352

Author: Philip Sequeira (paseque@hawaii.edu)
Date: December 2020
Filename: server.js
Description: 
    'server.js' is the Express server for the store 'CPU City'.
*/

let express = require('express');
let myParser = require("body-parser");
let fs = require('fs');
let cookieParser = require('cookie-parser');
let session = require('express-session')
const nodemailer = require('nodemailer');
let products = require('./product_data.json');
let user_data_filename = 'user_data.json';
const SESSION_SECRET = "ITM 352";
const SESSION_NAME = "sid";
const PORT = 8080;
let date_ob = new Date();
let app = express();

app.use(myParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    name: SESSION_NAME,
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60,
        sameSite: true
    }
}));

let users_reg_data = {};

//object holding validation regex values
const validator = {
    "fullname": /[a-zA-Z\ ]{1,30}/,
    "username": /[a-zA-Z0-9]{4,10}/,
    "password": /.{6,}/,
    "email": /^[a-zA-Z0-9._]+@[a-zA-Z0-9.]+\.[a-zA-Z]{2,3}$/
};

//checks if user data file exists and parses to JSON
if (fs.existsSync(user_data_filename)) {
    let data = fs.readFileSync(user_data_filename, 'utf-8');
    users_reg_data = JSON.parse(data);
} else {
    //display error when data file not found
    let err_msg = `------------ERROR-------------\nThe file: \'${user_data_filename}\' could not be found.\nCheck the file path of ${user_data_filename}\n------------------------------`;
    console.log(err_msg);
}

//returns formatted timestamp
//from https://usefulangle.com/post/187/nodejs-get-date-time
function get_timestamp() {
    // adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    let year = date_ob.getFullYear();

    // current hours
    let hours = date_ob.getHours();

    // current minutes
    let minutes = date_ob.getMinutes();

    // current seconds
    let seconds = date_ob.getSeconds();

    // prints date & time in YYYY-MM-DD HH:MM:SS format
    return year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
}

//checks if input is non-negative integer
//returns a string message in the first element of an array if error found
function isStrNonNegInt(str, errlog = false) {
    let errors = []; // assume no errors at first
    let msg = {}; //set error messages
    msg.notNum = 'Please enter a number!';
    msg.notPos = 'Please enter a positive number!';
    msg.notInt = 'Please enter an integer!';
    msg.notPosInt = 'Please enter a positive integer!';

    // Check if string is a number value
    if (Number(str) != str) {
        errors.push(msg.notNum);
        return errlog ? errors : false;
    }

    // Check if it is negative
    if (str < 0) errors.push(msg.notPos);

    // Check that it is an integer
    if (parseInt(str) != str) {
        //check if error is already non-negative
        if (errors.length > 0) {
            //replace notPos with notPostInt
            errors = [msg.notPosInt];
        }
        else {
            errors.push(msg.notInt);
        }
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
function process_quantity_form(req, res) {
    const POST = req.body;
    let sess = req.session;
    let contents = fs.readFileSync('./views/display_receipt.template', 'utf8');
    res.send(eval('`' + contents + '`')); // render template string

    //returns user's name
    function get_user_name() {
        return sess.user.fullname;
    }

    //returns personalization by showing logged in user's name or login button
    function load_top_right() {
        let str = '';
        //if not logged in, show link to login link in 
        if (sess.logged_in !== true) {
            str += "<a href='/login' style='text-decoration: none;font-size:0.8em'><em>Login</em></a>";
            return str;
        } else {
            str += `Welcome, ${sess.user.fullname}!`;
            return str;
        }
    }

    //loads user's info for confirmation
    function load_user_info() {
        return sess.user.email;
    }

    //display table rows
    //adapted from example https://dport96.github.io/ITM352/morea/130.Assignment1/experience-Assignment1_workshop.html
    function display_recipt_items() {
        subtotal = 0;
        str = '';

        //make man and gen objects
        let manufacturers = Object.keys(sess.cart);
        console.log(manufacturers)
        let generations = [];

        //iterate through all manufacturers and generations in the cart and list their corresponding info from the product data file
        for (man in manufacturers) {
            generations = Object.keys(sess.cart[manufacturers[man]]);
            for (gen in generations) {

                //add product rows
                for (product in products[manufacturers[man]][generations[gen]]) {
                    qty = sess.cart[manufacturers[man]][generations[gen]][product];

                    if (qty > 0) {
                        // product row
                        extended_price = qty * products[manufacturers[man]][generations[gen]][product].price
                        subtotal += extended_price;
                        str += (`
                            <tr>
                                <td width="43%">${[manufacturers[man]]} <span id="product_range">${products[manufacturers[man]][generations[gen]][product].range}</span> ${products[manufacturers[man]][generations[gen]][product].model}</td>
                                <td align="center" width="11%">${qty}</td>
                                <td width="13%">\$${products[manufacturers[man]][generations[gen]][product].price}</td>
                                <td width="54%">\$${extended_price.toFixed(2)}</td>
                            </tr>
                        `);
                    }
                }
            }
        }

        // Compute tax
        tax_rate = 0.0575;
        tax = calculate_tax(tax_rate, subtotal);

        // Compute shipping
        shipping = calculate_shipping(subtotal);

        // Compute grand total
        total = subtotal + tax + shipping;

        //save contents for confirmation email
        sess.confirmation = sess.cart;

        //clears current user's cart
        delete sess.cart;

        return str;
    }
}

//load product menu
function load_menu() {
    console.log("loading product menu");
    let str = '';
    let manufacturers = Object.keys(products);

    //load manufacturing menu
    str += `<!-- Manufacturer Menu -->
    <div id="man" class="w3-card-4" style="max-width:900px;margin:auto">
        <div class="w3-container w3-blue">
            <h2>Manufacturer</h2>
        </div>
        <br>
        <div class="w3-row-padding">`;

    //iterates through products to get manufacturers
    manufacturers.forEach((manufacturer) => {
        str += `
                <div class="w3-half">
                    <button type="button" class="w3-input w3-btn w3-white w3-hover-blue w3-border" onclick="document.getElementById('${manufacturer.toLowerCase()}').style.display='block'; document.getElementById('man').style.display='none'; document.getElementById('back-man').classList.toggle('w3-opacity');">${manufacturer}</button>
                </div>`;
    });

    str += `</div>
            <br>
            </div>`;

    //load generation menus

    str += `
        <!-- Generation Menus -->
        `;

    //iterates through products to get manufacturers
    manufacturers.forEach((manufacturer) => {
        let generations = Object.keys(products[manufacturer]);

        str += `
                <!-- ${manufacturer} -->
                <div id="${manufacturer.toLowerCase()}" class="w3-card-4" style="max-width:900px;margin:auto;display:none">
                    <div class="w3-container w3-blue">
                        <h2><span id="back-man" class="w3-margin-right w3-hover-opacity" onclick="document.getElementById('${manufacturer.toLowerCase()}').style.display='none'; document.getElementById('man').style.display='block';"><a>Manufacturer</a></span> <span class="w3-animate-left">${manufacturer}</span></h2>
                    </div>
                    <br>

                    <div class="w3-row-padding">`;

        generations.forEach((generation) => {
            str += `<div class="w3-half">
                    <a href="./products?man=${manufacturer}&gen=${generation}"><button type="button" class="w3-input w3-btn w3-white w3-hover-blue w3-border">${generation}</button></a>
                </div>`;
        });

        str += `</div>
                    <br>
                </div>`;
    });

    return str;
}


//sends email confirmation to user
//from Example 3: https://dport96.github.io/ITM352/morea/180.Assignment3/reading-code-examples.html
function send_email_confirmation(req, res) {

    let sess = req.session;
    let invoice_str = '';
    let user_email = sess.user.email;

    //display table rows
    //adapted from example https://dport96.github.io/ITM352/morea/130.Assignment1/experience-Assignment1_workshop.html
    function display_recipt_items() {
        subtotal = 0;
        str = '';

        //make man and gen objects
        let manufacturers = Object.keys(sess.confirmation);
        let generations = [];

        //iterate through all manufacturers and generations in the cart and list their corresponding info from the product data file
        for (man in manufacturers) {
            generations = Object.keys(sess.confirmation[manufacturers[man]]);
            for (gen in generations) {

                //add product rows
                for (product in products[manufacturers[man]][generations[gen]]) {
                    qty = sess.confirmation[manufacturers[man]][generations[gen]][product];

                    if (qty > 0) {
                        // product row
                        extended_price = qty * products[manufacturers[man]][generations[gen]][product].price
                        subtotal += extended_price;
                        str += (`
                            <tr>
                                <td width="43%">${[manufacturers[man]]} <span id="product_range">${products[manufacturers[man]][generations[gen]][product].range}</span> ${products[manufacturers[man]][generations[gen]][product].model}</td>
                                <td align="center" width="11%">${qty}</td>
                                <td width="13%">\$${products[manufacturers[man]][generations[gen]][product].price}</td>
                                <td width="54%">\$${extended_price.toFixed(2)}</td>
                            </tr>
                        `);
                    }
                }
            }
        }

        // Compute tax
        tax_rate = 0.0575;
        tax = calculate_tax(tax_rate, subtotal);

        // Compute shipping
        shipping = calculate_shipping(subtotal);

        // Compute grand total
        total = subtotal + tax + shipping;

        //clears confirmation temp cart
        delete sess.confirmation;

        return str;
    }

    invoice_str += `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Karma">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
        <title>Email Confirmation</title>
    </head>
    <body>`;

    invoice_str += `
    <!-- table borrowed from example with w3 style applied -->

    <h1>Thank you for your purchase, ${sess.user.fullname}!</h1>
    <h2>Here is your email invoice. If you feel like we missed anything, contact the creator at paseque@hawaii.edu</h2>
        <table class="w3-table-all w3-card-4 w3-animate-top" style="max-width:1200px;margin:auto">
            <div class="w3-container w3-blue w3-animate-top">
                <h2 class="w3-center">Shopping Cart</h2>
            </div>
            <tbody>
                <!-- table heading -->
                <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Extended Price</th>
                </tr>

                <!-- product rows -->
                ${display_recipt_items()}

                <!-- blank row -->
                <tr class="w3-panel w3-bottombar w3-topbar">
                    <td colspan="4" width="100%">&nbsp;</td>
                </tr>

                <!-- subtotal -->
                <tr>
                    <td style="text-align: center;" colspan="3" width="67%">Sub-total</td>
                    <td width="54%">$
                        ${subtotal.toFixed(2)}
                    </td>
                </tr>

                <!-- tax -->
                <tr>
                    <td style="text-align: center;" colspan="3" width="67%">Tax @
                        ${(100 * tax_rate)}%</td>
                    <td width="54%">\$${tax.toFixed(2)}</td>
                </tr>

                <!-- shipping fee -->
                <tr>
                    <td style="text-align: center;" colspan="3" width="67%">Shipping*</td>
                    <td width="54%">\$${shipping.toFixed(2)}</td>
                </tr>

                <!-- total -->
                <tr>
                    <td style="text-align: center;" colspan="3" width="67%"><strong>Total</strong></td>
                    <td width="54%"><strong>\$${total.toFixed(2)}</strong></td>
                </tr>
            </tbody>
        </table>`;

    invoice_str += `</body>
        </html>`;

    // Set up mail server. Only will work on UH Network due to security restrictions
    let transporter = nodemailer.createTransport({
        host: "mail.hawaii.edu",
        port: 25,
        secure: false, // use TLS
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false
        }
    });

    let mailOptions = {
        from: 'itm352_confirmation_cpu_city@test.com',
        to: user_email,
        subject: `Thank you for your (fake) purchase, ${sess.user.fullname}! - ITM 352 Assignment 3`,
        html: invoice_str
    };

    transporter.sendMail(mailOptions, function (error, info) {

        console.log(info);
        if (error) {
            invoice_str += '<br>There was an error and your invoice could not be emailed :(';
            res.send(invoice_str);
        } else {
            console.log(`Your invoice was mailed to ${user_email}`);
            res.redirect('/menu');
        }
    });
}


//processes product page requests
function process_product_page(req, res) {
    let sess = req.session;

    //check for valid query strings
    if (req.query['man'] == 'undefined' || req.query['gen'] == 'undefined') {
        //invalid page, redirect to index
        res.redirect('index.html');
    }

    //set manufacturer and generation for page
    let man = req.query['man'];
    let gen = req.query['gen'];

    //track page for shopping cart
    res.cookie("man", man);
    res.cookie("gen", gen);

    //send the product page template
    let contents = fs.readFileSync('./views/product_page.template', 'utf8');
    res.send(eval('`' + contents + '`')); // render template string

    //returns personalization by showing logged in user's name or login button
    function load_top_right() {
        let str = '';

        //if not logged in, show link to login link in 
        if (sess.logged_in !== true) {
            str += "<a href='/login' style='text-decoration: none;font-size:0.8em'><em>Login</em></a>";
            return str;
        } else {
            str += `Welcome, ${sess.user.fullname}!`;
            return str;
        }
    }

    //holds function to display the logout option
    function load_logout_button() {
        //if not logged in, show login button
        if (sess.logged_in !== true) {
            return `<a href="/login" onclick="w3_close()" class="w3-bar-item w3-button fa fa-sign-in"> Login/Register</a>`;
        } else {
            return `<a href="/logout" onclick="w3_close()" class="w3-bar-item w3-button fa fa-sign-out"> Logout</a>`;
        }
    }

    //holds function to display the shopping cart option
    function load_cart_button() {
        //if no cart, no button
        if (typeof sess.cart !== 'undefined') {
            return `<a href="/cart" onclick="w3_close()" class="w3-bar-item w3-button fa fa-shopping-cart"> Shopping Cart</a>`;
        } else {
            return ``;
        }
    }

    //loads product selection and quantity forms
    function load_product_list() {
        str = '';
        let i = 0;

        while (i < products[man][gen].length) {

            //add start div
            str += `<div class="w3-row-padding w3-padding-16 w3-center">`;

            //group by fours for layout
            for (let j = 0; j < 4; j++) {
                str += `
                    <section id="product_${i}" class="w3-animate-top">
                        <div class="w3-quarter">
                            <img src="images/${products[man][gen][i].image}" alt="product image" style="width:100%;max-width:250px" class="w3-opacity-min w3-hover-opacity-off w3-image">
                            <h3>${products[man][gen][i].range} ${products[man][gen][i].model}</h3>
                            <p>$${products[man][gen][i].price}</p>

                            <label for="quantity_textbox"><span id='qty_textbox_message_${i}'>Quantity Desired:</span></label>
                            <input type="text" id="quantity_textbox_${i}" placeholder="0" name="quantity_textbox_${i}" onkeyup="checkQuantityTextbox(this.value, ${i});">
                        </div>
                    </section>
                `
                if (j < 3 && i + 1 < products[man][gen].length) {
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

        if (typeof sess.errors !== 'undefined' && sess.errors.length > 0) {

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
            for (error in sess.errors) {
                str += `
                                        <h4 style="color:red;">${sess.errors[error]}</h4>
                                    `;
            }

            str += `
                                <br>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            //clear session error array
            delete sess.errors;
        }

        return str;
    }

}

//shows error page when there is an error in the quantity entry
function process_error(req, res, errors) {

    let sess = req.session;

    //update session errors
    sess.errors = errors;

    //send back to last page
    res.redirect('back');
}

//process registration
function process_reg(req, res) {
    let sess = req.session;
    const POST = req.body;

    //set session new registration flag to false
    sess.new_reg = false;

    //setup error collector
    let errors = [];

    //store requested username and password to local object
    let req_user = {};
    req_user.username = POST['reg_username'];
    req_user.password = POST['reg_password'];
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
    if (!validator.email.test(req_user.email)) {
        errors.push('Please enter valid email address');
    }

    //check if passwords match
    if (req_user.password != POST['reg_repeat_password']) {
        errors.push('Passwords do not match');
    }

    //standardize stored usernames to be all lowercase
    req_user.username = req_user.username.toLowerCase();

    //check if username is available
    if (typeof users_reg_data[req_user.username] != 'undefined') {
        errors.push('Username taken');
    }

    //process errors if any found
    if (errors.length > 0) {
        process_error(req, res, errors);
    }

    //if successful, add data and return to login
    else {

        // set display registration success message flag to true
        sess.new_reg = true;

        //update temp fullname to be the newly registered user's name for greeting
        sess.reg_name = req_user.fullname;

        //save username
        let username = req_user.username;

        //remove redundante username from req_user
        delete req_user.username;

        console.log(req_user);


        //add req user to users_reg_data
        users_reg_data[username] = req_user;
        data = JSON.stringify(users_reg_data)

        //write users_req_data to user data file
        try {
            fs.writeFileSync(user_data_filename, data, 'utf-8');
        } catch (e) {
            console.log('some kind of write error', e);
        }
        res.redirect('/login');
    }
}

///process login
function process_login(req, res) {
    const POST = req.body;
    let sess = req.session;

    //set bad username and password flags
    let bad_username = true;
    let bad_password = true;

    //collect errors in an array
    let errors = [];

    //store requested username and password to local object
    let req_user = {};
    req_user.username = POST['login_username'].toLowerCase();
    req_user.password = POST['login_password'];

    //checks username and password
    //check if user exists
    if (typeof users_reg_data[req_user.username] != 'undefined') {
        bad_username = false;

        //check if password matches user
        if (typeof users_reg_data[req_user.username].password != 'undefined') {
            bad_password = false;
        }
    }

    //push errors to errors array
    if (bad_username === true) errors.push('Username not found');
    if (bad_password === true) errors.push('Password is invalid');

    //if both the username and password are ok, login
    if (errors.length === 0) {

        //login
        sess.user = users_reg_data[req_user.username];
        sess.user.username = req_user.username;
        sess.logged_in = true;
        console.log(`${get_timestamp()}: User '${sess.user.username}' has logged in.`);

        //check for held order and transfer to this cart if there, else show menu
        if (sess.hold_order !== true) res.redirect('/menu');
        else res.redirect('/cart');
    }

    //if username or password is not correct, respond with error
    else {
        sess.logged_in = false;
        process_error(req, res, errors);
    }
}

//logs out user
//destroy code adapted from https://codeforgeek.com/manage-session-using-node-js-express-4/
function logout_user(req, res) {
    let sess = req.session;

    //logs out user unless not logged in
    if (sess.logged_in) {
        let temp = sess.user.username;

        //destroy session
        sess.destroy((err) => {
            if (err) {
                console.log(`Error with destroying session: ${err}`);
            }
        });

        //report logout
        console.log(`${get_timestamp()}: User '${temp}' has logged out`);

        //send to login page
        res.redirect('/login');

    } else {
        //log error
        console.log(`${get_timestamp()}: Tried to log out, but not logged in`);

        //redirect to menu
        res.redirect('/menu');
    }
}

//validate add cart form and either process or redirect to login
function validate_add_cart_form(req, res) {
    let sess = req.session;
    const POST = req.body;

    //set manufacturer and generation for page
    let man = req.cookies['man'];
    let gen = req.cookies['gen'];

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
        if (qty == '' || qty == 0) blanks++;
        if (blanks == products[man][gen].length) error.push("There is nothing in your cart!");

        //check if value is valid or empty
        if (!isStrNonNegInt(qty) && qty != '') {
            //collect errors to report
            error.push(`<span style="color: grey">For ${products[man][gen][i].range} ${products[man][gen][i].model}:</span> ${isStrNonNegInt(qty, true)}`);
        }
        i++;
    }

    //show errors if there are any
    if (error.length != 0) {
        process_error(req, res, error);
    }

    //check if logged in, then process accordingly
    else {

        //define cart
        if (typeof sess.cart == 'undefined') {
            sess.cart = {};
        }
        if (typeof sess.cart[man] == 'undefined') {
            sess.cart[man] = {};
        }
        if (typeof sess.cart[man][gen] == 'undefined') {
            sess.cart[man][gen] = [Number(0)];
        }

        i = 0;
        //add items to cart
        for (let [product, qty] of Object.entries(POST)) {
            //stop the loop on the last key, the checkout
            if (product != `quantity_textbox_${i}`) break;

            if (typeof sess.cart[man][gen][i] == 'undefined') {
                sess.cart[man][gen][i] = Number(0);
            }
            sess.cart[man][gen][i] += Number(qty);
            i++;
        }

        //if not logged in, redirect to login
        if (sess.logged_in !== true) {

            //set flag to bring to shopping cart on log in to see their cart items
            sess.hold_order = true;

            //ask to login
            res.redirect('/login');
        }

        //if logged in, show shopping cart
        else res.redirect('/cart');
    }
}

//shows shopping cart page
function show_cart(req, res) {
    let sess = req.session;
    let tax_rate = 0.0575;

    let contents = fs.readFileSync('./views/shopping_cart.template', 'utf8');
    res.send(eval('`' + contents + '`')); // render template string

    //returns user's name
    function get_user_name() {
        if (sess.logged_in !== true) return 'Guest';
        else return sess.user.fullname;
    }

    //returns personalization by showing logged in user's name or login button
    function load_top_right() {
        let str = '';
        //if not logged in, show link to login link in 
        if (sess.logged_in !== true) {
            str += "<a href='/login' style='text-decoration: none;font-size:0.8em'><em>Login</em></a>";
            return str;
        } else {
            str += `Welcome, ${sess.user.fullname}!`;
            return str;
        }
    }

    //display table rows
    //adapted from example https://dport96.github.io/ITM352/morea/130.Assignment1/experience-Assignment1_workshop.html
    function display_cart_items() {
        let i = 0;
        subtotal = 0;
        str = '';

        //make man and gen objects
        let manufacturers = Object.keys(sess.cart);
        let generations = [];

        for (man in manufacturers) {
            generations = Object.keys(sess.cart[manufacturers[man]]);
            for (gen in generations) {

                //add product rows
                for (product in products[manufacturers[man]][generations[gen]]) {
                    qty = sess.cart[manufacturers[man]][generations[gen]][product];

                    if (qty > 0) {
                        // product row
                        extended_price = qty * products[manufacturers[man]][generations[gen]][product].price
                        subtotal += extended_price;
                        str += (`
                            <tr>
                                <td width="43%">${[manufacturers[man]]} <span id="product_range">${products[manufacturers[man]][generations[gen]][product].range}</span> ${products[manufacturers[man]][generations[gen]][product].model}</td>
                                <td align="center" width="11%"><span id="minus_${i}"></span>   <span id="quantity_${i}">${qty}</span></td>
                                <td width="13%">\$${products[manufacturers[man]][generations[gen]][product].price}</td>
                                <td width="54%">\$${extended_price.toFixed(2)}</td>
                            </tr>
                        `);
                        i++;
                        
                    }
                }
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



//###############################CONTROLLER###############################

//prints a log of all incoming requests
app.all('*', function (req, res, next) {
    console.log(`${get_timestamp()}: ${req.sessionID} ${req.method} to path ${req.path}`);
    next();
});

//checks for valid input and returns the receipt page if POST data is valid, or the error form if there is a problem
app.post("/process_form", function (req, res) {
    //validate checkout form and either process or redirect to login
    validate_add_cart_form(req, res);
});

///process registration
app.post('/process_reg', (req, res) => {
    process_reg(req, res);
});

///process login
app.post('/process_login', (req, res) => {
    process_login(req, res);
});

//load the product page
app.get('/products', (req, res) => {
    process_product_page(req, res);
});

//load the shopping cart page
app.get('/cart', (req, res) => {
    let sess = req.session;
    //remove hold order flag if redirected from successful login
    if (sess.hold_order && sess.logged_in) {
        delete sess.hold_order;
    }

    //if manually entering cart with nothing in cart, redirect to menu
    if (typeof sess.cart === 'undefined') {
        res.redirect('/menu');
    }

    show_cart(req, res);
});

//load the menu page
app.get('/menu', (req, res) => {
    let sess = req.session;

    let contents = fs.readFileSync('./views/menu.template', 'utf8');
    res.send(eval('`' + contents + '`')); // render template string

    //returns personalization by showing logged in user's name or login button
    function load_top_right() {
        let str = '';

        //if not logged in, show link to login link in 
        if (sess.logged_in !== true) {
            str += "<a href='/login' style='text-decoration: none;font-size:0.8em'><em>Login</em></a>";
            return str;
        } else {
            str += `Welcome, ${sess.user.fullname}!`;
            return str;
        }
    }

    //holds function to display the logout option
    function load_logout_button() {
        //if not logged in, show login button
        if (sess.logged_in !== true) {
            return `<a href="/login" onclick="w3_close()" class="w3-bar-item w3-button fa fa-sign-in"> Login/Register</a>`;
        } else {
            return `<a href="/logout" onclick="w3_close()" class="w3-bar-item w3-button fa fa-sign-out"> Logout</a>`;
        }
    }

    //holds function to display the shopping cart option
    function load_cart_button() {
        //if no cart, no button
        if (typeof sess.cart !== 'undefined') {
            return `<a href="/cart" onclick="w3_close()" class="w3-bar-item w3-button fa fa-shopping-cart"> Shopping Cart</a>`;
        } else {
            return ``;
        }
    }
});

//send confirmation email
app.get('/send_email', (req, res) => {
    send_email_confirmation(req, res);
});

//process logout
app.get('/logout', (req, res) => {
    logout_user(req, res)
});

//process check out
app.get('/check_out', (req, res) => {
    process_quantity_form(req, res);
});

//load the login page
app.get('/login', (req, res) => {
    let sess = req.session;

    //logout if trying to log in while already logged in
    if (sess.logged_in){
        res.redirect("/logout");
    }

    let contents = fs.readFileSync('./views/login.template', 'utf8');
    res.send(eval('`' + contents + '`')); // render template string

    //returns errors for modals
    function report_error() {
        str = '';

        if (typeof sess.errors !== 'undefined' && sess.errors.length > 0) {

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
            for (error in sess.errors) {
                str += `
                                        <h4 style="color:red;">${sess.errors[error]}</h4>
                                    `;
            }

            str += `
                                <br>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            //clear session error array
            delete sess.errors;
        }

        return str;
    }


    //returns registration success message in a modal
    function display_new_reg_welcome() {
        str = '';
        if (sess.new_reg) {
            str += `
                <div class="w3-container">
                    <div id="reg-success" class="w3-modal">
                        <div class="w3-modal-content w3-animate-top w3-card-4">
                            <header class="w3-container w3-blue"> 
                                <span onclick="document.getElementById('reg-success').style.display='none'" 
                                class="w3-button w3-display-topright" style="font-size:2em">&times;</span>
                                <h2>Welcome, ${sess.reg_name}!</h2>
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

            //remove new reg variable
            delete sess.new_reg;
        }
        return str;
    }
});

//load the index page
app.get('/', (req, res) => {
    res.redirect('index.html');
});

//########################################################################

app.use(express.static('./public'));

app.listen(PORT, () => console.log(`listening on port ${PORT}`));