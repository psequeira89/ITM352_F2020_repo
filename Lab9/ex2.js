//1. Robot keeps moving forever
//2. Robot never gets stuck

//this algorithm makes the robot constantly go forward
//if something blocks its path, it turns right
//and tries again until it can go forward again


//create robot object
let controller = {
    isStuck: false, //boolean to check if stuck initialized to false
    move: function(){
        //some code to make robot go forward
        //if it cannot, sets this.isStuck to true
    },
    rotate: function(){
        //some code to make robot turn clockwise
    }
}

let go = true;
while (true){
    go = controller.move();
    if (!go) {
        controller.rotate();
    }
}