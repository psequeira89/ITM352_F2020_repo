//port can be set using first argument
//defaults to port 5000
//FUNCTION DOES NOT VALIDATE VALID PORT NUMBERS
// function setPort(argv){
//     let port = 5000;

//     if (argv.length <= 2){
//         return port;
//     }
//     else{
//         port = Number(argv[2]);
//         return port;
//     }
// }

const http = require('http');
const { report } = require('process');
const url = require('url');
const port = 5000;
let itemList = [
    {
        "item": "Gillette Sensor 3 Razor",
        "quantity": 2,
        "price": 1.23
    },
    {
        "item": "Barbasol Shaving Cream",
        "quantity": 1,
        "price": 2.64
    },
    {
        "item": "Nautica Cologne",
        "quantity": 1,
        "price": 6.17
    },
    {
        "item": "Rubbing Alcohol",
        "quantity": 3,
        "price": 0.98
    },
    {
        "item": "Colgate Classic Toothbrush",
        "quantity": 12,
        "price": 1.89
    },
    {
        "item": "Hyerin's Cream",
        "quantity": 2,
        "price": 40.89
    },
    {
        "item": "Toaster Oven",
        "quantity": 2,
        "price": 49.30
    }
];

var server = http.createServer(function (req, res) {
    console.log(`Request was made from: ${req.url}`);

    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
        "Access-Control-Max-Age": 2592000, // 30 days
        "Content-Type": "application/json"
    };
    
    function addItem(item, quant, price){
        let newItem = {
            "item": item,
            "quantity": quant,
            "price": price
        };

        return newItem;
    }

    const queryObject = url.parse(req.url,true).query;
    let item;
    let quant;
    let price;

    //add an item to the list and redirect back to experiment page
    if (queryObject.name != null && queryObject.name != ""){
        item = queryObject.name;
        quant = Number(queryObject.quant);
        price = Number(queryObject.price);
    
        itemList.push(addItem(item, quant, price));
    
        res.writeHead(301, {'Location': 'http://localhost:5500/Lab10/experiment.html'});
        res.end();
    }

    else if (queryObject.report === 'true'){
        res.writeHead(200, headers);
        res.write(JSON.stringify(itemList));
        res.end();

    }

    else if (queryObject.clear === 'Clear'){
        res.writeHead(301, {'Location': 'http://localhost:5500/Lab10/experiment.html'});
        itemList = [];
        res.end();
    }

    //400 error, invalid syntax
    else
    {
        res.writeHead(400, {'Content-Type': 'text/plain'});
        res.write("ERROR 400: Bad Request\n");
        res.end("Invalid Data detected.. Good Bye!");
    }
}).listen(port);

console.log(`Node.js web server at port ${port} is running..`);
