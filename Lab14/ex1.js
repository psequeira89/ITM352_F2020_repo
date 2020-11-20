let fs = require('fs');
let user_data_filename = 'user_data.json';

let data = fs.readFileSync(user_data_filename, 'utf-8');

let users_reg_data = JSON.parse(data);

console.log(users_reg_data);

function getPassword(username){
    return users_reg_data[username].password;
}

console.log(`Dan Port's password is: ${getPassword('dport')}`);