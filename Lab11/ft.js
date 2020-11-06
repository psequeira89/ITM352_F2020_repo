//function tests

var name = "Phil";
var age = 30;

var attributes  =  `${name};${age};${age + 0.5};${0.5 - age}`;
var pieces = attributes.split(";");

// var str = pieces.toString();

//console.log(str);

// for (item in pieces){
//     console.log(pieces[item]);
// }

/*
Function Name:
    isStrNonNegInt()

Description:
    Takes a string and returns true if it is a non-negative integer, else false.
    If the optional errlog parameter is true, will return array of any errors instead of false.

Params:
    string str:
        The string to check if is non negative integer

    boolean errlog (optional):
        If true, returns array of all errors if found
        instead of boolean. Defaults to false.
*/
function isStrNonNegInt(str, errlog = false){
    var errors = []; // assume no errors at first
    if(Number(str) != str) errors.push('Not a number!'); // Check if string is a number value
    if(str < 0) errors.push('Negative value!'); // Check if it is non-negative
    if(parseInt(str) != str) errors.push('Not an integer!'); // Check that it is an integer
    return errlog ? errors : (errors.length == 0);
}

pieces.forEach( (i) => {
    console.log(`Boolean Test for ${pieces[i]}: ${isNonNegInt(pieces[i], false)}`);
    //console.log(`Array Test for ${pieces[i]}: ${isStrNonNegInt(pieces[i], true)}`);
})
    
