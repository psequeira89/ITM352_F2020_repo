//c
let exitCode = 0;
let age = 30;
let i = 1;

while (i <= age) {
    if ( i > (age/2) ){
        console.log(`Don\'t ask how old I am\!`);
        process.exit(exitCode);
    }
    console.log(i);
    i++;
}
