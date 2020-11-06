var product1 = { 'name': 'small gumball', 'price': 0.02 };
var product2 = { 'name': 'medium gumball', 'price': 0.05 };
var product3 = { 'name': 'large gumball', 'price': 0.07 };

// array of all products
var products = [product1, product2, product3];
var cart_quantities = [2,0,4]; // corresponds to products array

for (i in cart_quantities){
    console.log(`Extended Cost for ${products[i].name}: $${products[i].price * cart_quantities[i]}`);
}