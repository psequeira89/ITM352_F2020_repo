let express = require('express');
let myParser = require("body-parser");
let fs = require('fs');
let products = require('./public/product_data.json');
let app = express();
const PORT = 8080;

//checks if input is non-negative integer
function isStrNonNegInt(str, errlog = false){
    let errors = []; // assume no errors at first
    if(Number(str) != str) {
        errors.push('Not a number!'); // Check if string is a number value
        return errlog ? errors : (errors.length == 0);
    }
    if(str < 0) errors.push('Negative value!'); // Check if it is non-negative
    if(parseInt(str) != str) errors.push('Not an integer!'); // Check that it is an integer
    return errlog ? errors : (errors.length == 0);
}

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

//process the checkout and return receipt page
function process_quantity_form(POST, response){
    let product = POST.product_selection;
    let range = products[product].range;
    let model = products[product].model;
    let model_price = products[product].price;
    //let image = products[product].image;

    if (typeof POST['quantity_textbox'] != 'undefined') {
        let purchase_qty = POST['quantity_textbox'];

        //validate quantity text and respond with receipt template if valid
        if (isStrNonNegInt(purchase_qty)) {
            let contents = fs.readFileSync('./views/display_receipt_template.view', 'utf8');
            response.send(eval('`' + contents + '`')); // render template string
        } else {//if not valid quantity, respond with error template
            response.send(`${purchase_qty} is not a quantity!`);
        }
    }
}
app.use(myParser.urlencoded({ extended: true }));

//prints a log of all incoming requests
app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path);
    next();
});

//returns the receipt page
app.post("/process_form", function (req, res) {
    console.log(req.body);
    process_quantity_form(req.body,res);
});

//validate and return shopping cart additions
app.post('/add_cart', (req,res)=>{
    console.log(req.body);
    add_quantity(req.body,res);
});

//load the products page
app.get('/products', (req,res)=>{
    let contents = fs.readFileSync('./views/product_page.template', 'utf8');
    res.send(eval('`' + contents + '`')); // render template string

    //loads product selection drop down menu
    function load_product_list(){
        console.log("loading product list");
        str = '';
        for (product in products){
            str += `
                <option id="product_${product}" value="${product}">${products[product].range} ${products[product].model}</option>
            `;
        }
        return str;
    }

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

//load the index page
app.get('/', (req,res)=>{
    res.redirect('index.html');
});




app.use(express.static('./public'));

app.listen(PORT, () => console.log(`listening on port ${PORT}`));
