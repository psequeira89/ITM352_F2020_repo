/*
Assignment 3 for ITM 352

Author: Philip Sequeira (paseque@hawaii.edu)
Date: December 2020
Filename: app.js
Description: 
    'app.js' holds functions for displaying client-side error checking for the store 'CPU City'.
*/

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

//resets error message after user deletes all text
function resetErrorMsg(msg) {
    msg.innerHTML = "Quantity Desired:";
    msg.style.color = "black";
}