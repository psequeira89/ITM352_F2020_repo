//EX. 1

age = 30;
num_years_grad = 1;

//a
console.log(age == num_years_grad);

//b
console.log(age != num_years_grad);

//c
console.log(age > num_years_grad);

//EX. 2

//a
console.log(age > 19 && age < 25);

//EX. 3

//a
//likesBeer is a boolean
//You don't always need a boolean datatype with the if statement but you do always need a create a conditional statement that will evaluate to true or false. i.e. (1 > 0) evaluates to true, but 1 and 0 are both numbers, not booleans.

name = "Philip";

likesBeer = true;

document.write(name + ' does ');

if ( !likesBeer )

    document.write('not ');

document.write('like beer!');

//b
//the answer would not still be the same, because a single '=' is the operator for assignment, not checking for equal values.

//c
name = "Philip";

likesBeer = true;

document.write(name + ' does ');

if ( !likesBeer ){

    document.write('not ');

    document.write('ever ')
}

document.write('like beer!');

