var age = 30;
var fav_num = 3;
var day_of_birth = 6;
var month_of_birth = 12;
var first_name = "Philip";
var last_name = "Sequeira";
console.log(age + fav_num / day_of_birth * month_of_birth);
console.log((age + fav_num) / day_of_birth * month_of_birth);


var n = 13;
var z = 15;

n = n % z + (n - 1);
console.log(`Result 1: ${n}`);

n = 13;
z = 15;

n = n-- % z + n;
console.log(`Result 2: ${n}`);

n = 13;
z = 15;

n = n % z + n - 1;
console.log(`Result 3: ${n}`);