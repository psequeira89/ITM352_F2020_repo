const express = require('express');
const app = express();
const port = 8080;

// app.use((req,res)=>{
//     console.log(`new request from ${req.url}`);
//     res.send("<h1 id='top'>Hello</h1>");

// });

// /test
app.get('/test', (req,res)=>{
    res.send('test');
});

app.post('/order',(req,res) =>{
    let quant = req.body.quantity_textbox;

    console.log(quant);
});

// /root
app.get('/', (req,res)=>{
    let title = "Home";

    res.send(`<!DOCTYPE html>
    <html lang='en'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>${title}</title>
    </head>
        <body>
        <h1>Welcome!</h1>
        <h2>This is the root directory.</h2>
        </body>
    </html>`);
});

// else
app.all('*', (req,res)=>{
    let title = "Error";

    res.send(`<!DOCTYPE html>
    <html lang='en'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>${title}</title>
    </head>
        <body>
        <h1>Sorry!</h1>
        <h2>This URL is not in use.</h2>
        </body>
    </html>`);
        
});

// app.all('*', function (request, response, next) {
//     response.send(request.method + ' to path ' + request.path);
// });
// app.get('/test',() =>{
//     console.log(`hello`);
// });


//app.use(express.static('./public'));


app.listen(port, () => console.log(`listening on port ${port}`)); // note the use of an anonymous function here