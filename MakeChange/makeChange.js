//Given n amount of money, displays exact change

//convert any input into integer number of cents
//store input money in a variable n
//store coin values as variables
    //quarters = 25
    //dimes = 10
    //nickels = 5
    //pennies = 1
//initialize variables to store coin amounts
    //numQuarters
    //numDimes
    //numNickels
    //numPennies

//if n > quarters
//decide how many quarters are needed and subtract from total
    //store n / 25 in numQuarters
    //n %= 25

//if n > dimes
//decide how many dimes are needed and subtract from total
    //store n / 10 in numDimes
    //n %= 10

//if n > nickels
//decide how many nickels are needed and subtract from total
    //store n / 5 in numNickels
    //n %= 5

//if n > 0
//remaining value is all pennies
    //numPennies = n

//return values in a pretty way

//---------------------------------//

//assign coin values
const q = 25;
const d = 10;
const n = 5;

//initialize coin counters to 0
let numQ = 0;
let numD = 0;
let numN = 0;
let numP = 0;

//get input value and multiply by 100 to start working change amount
let input = .55;
let change = Math.floor(input * 100);

//if change is greater than or equal to 25
if (change >= q){
    //assign numQ the rounded down result of change divided by 25
    numQ = Math.floor(change / q);

    //update change to the remainder of division of itself and 25.
    change %= q;
}

if (change >= d){
    numD = Math.floor(change / d);
    change %= d;
}

if (change >= n){
    numN = Math.floor(change / n);
    change %= n;
}

//assign numP the value of change
numP = change;

//output result
console.log(`Your change for $${input} is:\n${numQ} quarters\n${numD} dimes\n${numN} nickels\n${numP} pennies`);