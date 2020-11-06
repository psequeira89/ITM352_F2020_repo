
/*
//prints steps
let p = function(step) {
    for (i in step){
        console.log(`Step ${Number(i)+1}: ${step[i]}`);
    }
    console.log(`\n`);
}



//create step array
let step = [];

//step 1
step.push(year);
p(step);

//step 2
step.push(parseInt(step[0]/4));
p(step);

//step 3
step.push(step[0]+step[1]);
p(step);

//step 4


//step 5


//step 6


//step 7


//step 8

step.push(parseInt(step[0]/4));
p(step);

step.push(step[0]+step[0]);
p(step);
*/



//input birthday
let day = 6;
let month = 12;
let year = 89;


let step1 = 89;
let step2 = parseInt(step1/4);
let step3 = step2 + step1;
let step4 = 6;
let step5;
let step6 = step3 + step4;
let step7 = step6 + 5;
let step8 = step7;
let final = step8%7;
console.log(final);

//check if month is January
if (month != 1) {
    step4 = month;
}

else {
    step5 = step3 + day;
    console.log(step5);
}

