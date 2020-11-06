// -- Price depends on quantity
let quantity = 25;
let price;

if ( quantity >= 25 ) {
    price = 35;
}

else if ( quantity >= 10 ) {
    price = 50;
}

else if ( quantity > 0 ) {
    price = 100;
}

else {
    price = "no purchase";
}

console.log( quantity + ' products will cost ' + price + ' each.' );