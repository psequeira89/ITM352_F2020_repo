//warns user if input is not valid in the textbox
function checkQuantityTextbox(){
    var msg = document.getElementById('qty_textbox_message');
    resetErrorMsg(msg);
    var input = document.getElementById('quantity_textbox').value;
    var errorLog = isStrNonNegInt(input, true);
    
    if (errorLog.length != 0 && input.length > 0){
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

//resets all images to hidden
function resetSelection(){
    let i = 0;
    while (document.getElementById(`prod_${i}`) != null){
        if (document.getElementById(`prod_${i}`).getAttribute("style") != "display:none"){
            document.getElementById(`prod_${i}`).setAttribute("style", "display:none");
        }
        i++;
    }
}

//shows the currently selected item image
function updateImage(selected_index){
    resetSelection();
    document.getElementById(`prod_${selected_index}`).setAttribute("style", "display:block");
}

//resets error message after user deletes all text
function resetErrorMsg(msg){
    msg.innerHTML = "Enter a quantity";
    msg.style.color = "black";
}

//sets the first image and product to show after loading
function initializePage(){
    document.getElementById('prod_0').setAttribute("style", "display:block");
    document.getElementById('product_0').setAttribute("selected", true);
}

function addToCart(range, model, price, qty){
    ext_price = price * qty;
    cart.push({'range':`${range}`, 'model': `${model}`, 'price': `${price}`, 'ext_price': `${ext_price}`});
}

var cart = [];