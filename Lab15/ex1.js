var express = require('express');
var app = express();
let fs = require('fs');
var myParser = require("body-parser");
var cookieParser = require('cookie-parser');
let user_data_filename = 'user_data.json';
let users_reg_data = {};

app.use(myParser.urlencoded({ extended: true }));
app.use(cookieParser());

//checks if data file exists an prints the JSON if successful
if (fs.existsSync(user_data_filename)) {
    let data = fs.readFileSync(user_data_filename, 'utf-8');
    // console.log(`${user_data_filename} has ${fs.statSync(user_data_filename).size} characters`);
    users_reg_data = JSON.parse(data);

    // username = 'newuser';
    // users_reg_data[username] = {};
    // users_reg_data[username].password = 'newpass';
    // users_reg_data[username].email = 'newuser@user.com';

    // fs.writeFileSync(user_data_filename, JSON.stringify(users_reg_data));
}

//display error when data file not found
else {
    err_msg = `------------ERROR-------------\nThe file: \'${user_data_filename}\' could not be found.\nCheck the file path of ${user_data_filename}\n------------------------------`;
    console.log(err_msg);
    err_msg = `------------ERROR-------------<br>The file: \'${user_data_filename}\' could not be found.<br>Check the file path of ${user_data_filename}<br>-----------------------------------`;
    res.send(err_msg);
}

function process_login(req, res) {
    //set bad username and password flags
    let bad_username = true;
    let bad_password = true;

    //stores the currently selected username
    let this_user;

    //store requested username and password to local object
    let req_user = {};
    req_user.username = req.body['username'];
    req_user.password = req.body['password'];

    //get strings of usernames
    let usernames = Object.keys(users_reg_data);

    //iterates through user_data.json and checks req username/password 
    usernames.forEach((user, index) => {
        if (user == req_user.username){
            bad_username = false;
            this_user = user;
        }

        if (users_reg_data[user].password == req_user.password){
            bad_password = false;
        }
    });

    //if both the username and password are ok
    if (!bad_username && !bad_password) {
        str = `
            <body>
                <h2>Welcome, ${this_user}!</h2>
            </body>
        `;
        res.send(str);
    }

    //if username or password is not correct, respond with errora
    else {
        str = `
        <body>
            <h2>Username or password not found for user <em>${req_user.username}</em></h2>
        </body>
    `;
    res.send(str);
    }
}

function process_registration(req, res){
    const POST = req.body;

    //set validity check flags
    let taken_username = false;
    let nomatch_password = false;

    //set return string
    let str = '';

    console.log(POST);

    //store requested username and password to local object
    let req_user = {};
    req_user.username = POST['username'];
    req_user.password_1 = POST['password'];
    req_user.password_2 = POST['repeat_password'];
    req_user.email = POST['email'];

    //---validate input---

    //check if passwords match
    if (req_user.password_1 != req_user.password_2) {
        nomatch_password = true;
    }

    //check if username is available
    //iterates through user_data.json and checks req username
    let usernames = Object.keys(users_reg_data);
    usernames.forEach((user, index) => {
        if (user == req_user.username){
            taken_username = true;
        }
    });

    if (taken_username) {
        str += `
            <h2>The username <em>${req_user.username}</em> is already taken!</h2>
        `;
    }

    if (nomatch_password) {
        str += `
            <h2>The passwords do not match!</h2>
        `;
    }

    if (str != ''){
        str += `<a href="/register"><h3>Return to Registration page</h3></a>`
        res.send(str);
    }

    //if successful, add data and return to login
    else {
        users_reg_data[req_user.username] = {};
        users_reg_data[req_user.username].password = req_user.password_1;
        users_reg_data[req_user.username].email = req_user.email;

        fs.writeFileSync(user_data_filename, JSON.stringify(users_reg_data));

        res.redirect('/login');
    }
}

app.get("/set_cookie", function (request, response) {
    response.cookie('name', 'Phil').send("cookie set!");
});

app.get("/use_cookie", function (request, response) {
    let name = 'anonymous';

    if (typeof request.cookies['name'] != 'undefined'){
        name = request.cookies.name;
    }
    
    response.send(`Welcome to the Use Cookie page ${name}`);
});

app.get("/login", function (request, response) {
    // Give a simple login form
    str = `
        <body>
        <form action="" method="POST">
        <input type="text" name="username" size="40" placeholder="enter username" ><br />
        <input type="password" name="password" size="40" placeholder="enter password"><br />
        <input type="submit" value="Submit" id="submit">
        </form>
        </body>
    `;
    response.send(str);
 });

app.post("/login", function (request, response) {
    // Process login form POST and redirect to logged in page if ok, back to login page if not
    let POST = request.body;
    process_login(request, response);
});

app.get("/register", function (request, response) {
    // Give a simple register form
    str = `
        <body>
        <form action="" method="POST">
        <input type="text" name="username" size="40" placeholder="enter username" ><br />
        <input type="password" name="password" size="40" placeholder="enter password"><br />
        <input type="password" name="repeat_password" size="40" placeholder="enter password again"><br />
        <input type="email" name="email" size="40" placeholder="enter email"><br />
        <input type="submit" value="Submit" id="submit">
        </form>
        </body>
    `;
    response.send(str);
 });

 app.post("/register", function (request, response) {
    // process a simple register form
    process_registration(request, response);
 });

app.listen(8080, () => console.log(`listening on port 8080`));