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

// for server
    //Contains code for image carousel by Jesse from https://codepen.io/WillyW/pen/wZebow
    function load_carousel(){
        str = '';

        str += `
            <div class="container">
                <div class="card-carousel">
        `;

        for (product in products){
            str += `
                <div class="card" id="${product}">
                    <div class="image-container" style="background-image: url(${products[product].image})"></div>
                        <h1 class="card-text">${products[product].range} ${products[product].model}</h1>
                </div>
            `;
        }

        str += `
                </div>
            <a href="#" class="visuallyhidden card-controller">Carousel controller</a>
            </div>
        `;
        console.log(str);

        return str;
    }
});

//for server
//add quantity to client-side cart
function add_quantity(POST, res){
    let product = POST.product_selection;
    let range = products[product].range;
    let model = products[product].model;

    if (typeof POST['quantity_textbox'] != 'undefined') {
        let purchase_qty = POST['quantity_textbox'];

        //validate quantity text and add to cart
        if (isStrNonNegInt(purchase_qty)) {
            let contents = fs.readFileSync('./views/product_page.template', 'utf8');
            res.send(eval('`' + contents + '`')); // render template string

            
        } else {//if not valid quantity, respond with error template
            res.send(`${purchase_qty} is not a quantity!`);
        }
    }
}

//for server
  //loads product images and sets them all to hidden by default
  function display_products() {
    console.log("displaying products");

    str = '';
    for (product in products){
        str += `
            <div id="prod_${product}" style="display:none"><h3>${products[product].range} ${products[product].model} at \$${products[product].price}</h3>
            <img src="${products[product].image}" alt="product image" width="100"></div>
        `;
    }
    return str;
}
});

//for server
// //loads product selection and quantity forms for e
// function load_product_list() {
//     console.log("loading product list");
//     str = '';
//     for (product in products) {

//         str += `
//             <section id="product_${product}">
//                 <div class="product_name"><h2>${products[product].range} ${products[product].model}</h2></div>
//                 <div class="product_price"><h3>$${products[product].price}</h3></div>
//                 <div class="product_image"><img src="images/${products[product].image}" alt="image of ${products[product].range} ${products[product].model}" width="100px"></div>

//                 <label for="quantity_textbox"><span id='qty_textbox_message_${product}'>Quantity Desired:</span></label>
//                 <input type="text" id="quantity_textbox" placeholder="0" name="quantity_textbox_${product}" onkeyup="checkQuantityTextbox(this.value, ${product});">
                
//             </section>
//         `;
//     }
//     return str;
// }

// //loads product selection and quantity forms
// function load_product_list() {
//     console.log("loading product list");
//     str = '';
//     let i = 0;

//     while (i < products.length) {

//         //add start div
//         str += `<div class="w3-col l3 s6">`;

//         //group by twos for layout
//         for (let j = 0; j < 2; j++){
//             str += `
//                 <div class="w3-container">
//                     <img src="images/${products[i].image}" style="width:100%">
//                     <p>${products[i].range} ${products[i].model}<br><b>$${products[i].price}</b></p>
//                 </div>
//             `
//             if (j < 1 && i + 1 < products.length){
//                 i++;
//             }

//             else {
//                 break;
//             }
//         }

//         //add end div
//         str +=`</div>`

//         i++
//     }
//     return str;
// }