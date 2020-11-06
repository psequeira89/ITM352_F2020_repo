//warns user if input is not valid in the textbox
function checkQuantityTextbox(text_input, product){
    var msg = document.getElementById(`qty_textbox_message_${product}`);
    resetErrorMsg(msg);
    var errorLog = isStrNonNegInt(text_input, true);
    
    if (errorLog.length != 0 && text_input.length > 0){
        msg.innerHTML = errorLog;
        msg.style.color = "red";
    }
}

//checks if input is non-negative integer
function isStrNonNegInt(str, errlog = false){
    var errors = []; // assume no errors at first
    if(Number(str) != str) {
        errors.push('Not a number!'); // Check if string is a number value
        return errlog ? errors : (errors.length == 0);
    }
    if(str < 0) errors.push('Negative value!'); // Check if it is non-negative
    if(parseInt(str) != str) errors.push('Not an integer!'); // Check that it is an integer
    return errlog ? errors : (errors.length == 0);
}

//resets error message after user deletes all text
function resetErrorMsg(msg){
    msg.innerHTML = "Quantity Desired:";
    msg.style.color = "black";
}