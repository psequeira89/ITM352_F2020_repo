var express = require('express');
var app = express();
let fs = require('fs');
var myParser = require("body-parser");
let user_data_filename = 'user_data.json';
let data;
let users_reg_data = {};
let req_user = {};

app.use(myParser.urlencoded({ extended: true }));

//checks if data file exists an prints the JSON if successful
if (fs.existsSync(user_data_filename)) {
    data = fs.readFileSync(user_data_filename, 'utf-8');
    // console.log(`${user_data_filename} has ${fs.statSync(user_data_filename).size} characters`);
    users_reg_data = JSON.parse(data);
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
    req_user.username = req.body['username'];
    req_user.password = req.body['password'];

    //get strings of usernames
    const usernames = Object.keys(users_reg_data);


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
                <h2>Welcome, ${users_reg_data[this_user].name}!</h2>
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

    console.log(POST);
    process_login(request, response);
});

app.listen(8080, () => console.log(`listening on port 8080`));
