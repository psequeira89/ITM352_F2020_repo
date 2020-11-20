let fs = require('fs');
let user_data_filename = 'user_data.json';
let data;
let users_reg_data;

//checks if file exists an prints the JSON if successful
if (fs.existsSync(user_data_filename)) {
    data = fs.readFileSync(user_data_filename, 'utf-8');
    console.log(`${user_data_filename} has ${fs.statSync(user_data_filename).size} characters`);
}

//display error when file not found
else {
    console.log(`------------ERROR-------------\nThe file: \'${user_data_filename}\' could not be found.\nCheck the file path of ${user_data_filename}\n------------------------------`);
}

// function getPassword(username){
//     return users_reg_data[username].password;
// }

// console.log(`Dan Port's password is: ${getPassword('dport')}`);