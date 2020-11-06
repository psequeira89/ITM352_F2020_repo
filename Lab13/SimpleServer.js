var http = require('http');

//create a server object:
http.createServer(function (req, res) {
    console.log(req.headers); //output the request headers to the console
    res.writeHead(200, { 'Content-Type': 'text/html' }); // set MIME type to HTML 
    res.write(`<h1>The server date is: <span id="st">${Date.now()}</span></h1>`); //send a response to the client
    res.write('<h1>The client date is: <span id="ct"></span><script>document.getElementById("ct").innerHTML = Date.now();</script></h1>'); // send another response
    res.write(`<h1>The latency is: <span id="diff"></span> ms</h1><script>
    let st = document.getElementById("st").innerHTML;
    let ct = document.getElementById("ct").innerHTML;
    let latency = ct - st;
    document.getElementById("diff").innerHTML = latency;
    </script>
    `);
    res.end(); //end the response
}).listen(8080); //the server object listens on port 8080

console.log('Hello world HTTP server listening on localhost port 8080');