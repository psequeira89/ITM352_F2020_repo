//warns user if input is not valid in the textbox
function checkQuantityTextbox(text_input, product) {
    var msg = document.getElementById(`qty_textbox_message_${product}`);
    resetErrorMsg(msg);
    var errorLog = isStrNonNegInt(text_input, true);

    if (errorLog.length != 0 && text_input.length > 0) {
        msg.innerHTML = errorLog;
        msg.style.color = "red";
    }
}

//resets error message after user deletes all text
function resetErrorMsg(msg) {
    msg.innerHTML = "Quantity Desired:";
    msg.style.color = "black";
}

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