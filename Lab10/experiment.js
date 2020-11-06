let products = [];
let ext_prices = [];
const sales_tax = 0.0575;
let subtotal = 0;
let tax;
let total;
let table = document.querySelector("table");

function makeTableHead(table) {
    let th;
    let thead = table.createTHead();
    let row = thead.insertRow();

    th = document.createElement("th");
    th.innerHTML = "Item";
    th.setAttribute("width", "43%");
    row.appendChild(th);

    th = document.createElement("th");
    th.setAttribute("width", "13%");
    th.innerHTML = "Quantity";
    row.appendChild(th);

    th = document.createElement("th");
    th.setAttribute("width", "13%");
    th.innerHTML = "Price";
    row.appendChild(th);

    th = document.createElement("th");
    th.setAttribute("width", "54%");
    th.innerHTML = "Extended Price";
    row.appendChild(th);
}

function makeTable(table, data) {
    $("table").attr("border", 2);

    let row;
    let cell;

    //add product rows
    for (let i in data) {
        row = table.insertRow();

        for (let j = 0; j < 4; j++) {
            switch (j) {
                case 0:
                    cell = row.insertCell();
                    cell.innerHTML = `${products[i].item}`;
                    cell.setAttribute("width", "43%");
                    break;

                case 1:
                    cell = row.insertCell();
                    cell.innerHTML = `${products[i].quantity}`;
                    cell.setAttribute("width", "13%");
                    cell.setAttribute("class", "centered");
                    break;

                case 2:
                    cell = row.insertCell();
                    cell.innerHTML = `$${products[i].price.toFixed(2)}`;
                    cell.setAttribute("width", "13%");
                    break;

                case 3:
                    cell = row.insertCell();
                    cell.innerHTML = `$${ext_prices[i].toFixed(2)}`;
                    cell.setAttribute("width", "54%");
                    break;
            }
        }
    }

    //add blank
    row = table.insertRow();
    cell = row.insertCell();
    cell.innerHTML = "&nbsp";
    cell.setAttribute("colspan", "4");
    cell.setAttribute("width", "100%");

    //show subtotal
    row = table.insertRow();
    cell = row.insertCell();
    cell.innerHTML = "Sub-total";
    cell.setAttribute("colspan", "3");
    cell.setAttribute("width", "67%");
    cell.setAttribute("class", "centered");
    cell = row.insertCell();
    cell.innerHTML = `$${subtotal.toFixed(2)}`;
    cell.setAttribute("width", "54%");

    //show tax
    row = table.insertRow();
    cell = row.insertCell();
    cell.innerHTML = `Tax @ ${sales_tax*100}%`;
    cell.setAttribute("colspan", "3");
    cell.setAttribute("width", "67%");
    cell.setAttribute("class", "centered");
    cell = row.insertCell();
    cell.innerHTML = `$${tax.toFixed(2)}`;
    cell.setAttribute("width", "54%");

    //show total
    row = table.insertRow();
    cell = row.insertCell();
    cell.innerHTML = `<strong>Total</strong>`;
    cell.setAttribute("colspan", "3");
    cell.setAttribute("width", "67%");
    cell.setAttribute("class", "centered");
    cell = row.insertCell();
    cell.innerHTML = `<strong>$${total.toFixed(2)}</strong>`;
    cell.setAttribute("width", "54%");
}

function getProductData(){
    $.ajax({
        url: "http://localhost:5000/?report=true",
        dataType: "json",
        type: "GET"
    })
    .done((json) => {
        products = json;
        setup(products);
        makeTable(table, products);
        makeTableHead(table);
    })
    .fail((xhr,status,error) => {
        console.error(xhr,status,error);
    });
}

function setup(products){
    //Compute Extended Prices
    ext_prices = products.map(product => (
        product.quantity * product.price
    ));

    //compute Subtotal
    subtotal = ext_prices.reduce((acc, cv) => acc + cv);

    //Compute Tax
    tax = subtotal * sales_tax;

    //Grand total
    total = subtotal + tax;
}

//get the data and make the table
$(() => getProductData());


/*
//1st Attempt
function setCalcRows(){
    $("#h").append(`
    <table border="2">
        <thead>
        <tr>
            <th style="text-align: center;" width="43%">Item</th>
            <th style="text-align: center;" width="13%">Quantity</th>
            <th style="text-align: center;" width="13%">Price</th>
            <th style="text-align: center;" width="54%">Extended Price</th>
        </tr>
    </thead>`);

    setProductRows();

    $("#sum").html(`
    <tbody>
        <tr>
            <td colspan="4" width="100%">&nbsp;</td>
        </tr>
        <tr>
            <td style="text-align: center;" colspan="3" width="67%">Sub-total</td>
            <td width="54%">$${subtotal.toFixed(2)}</td>
        </tr>
        <tr>
            <td style="text-align: center;" colspan="3" width="67%"><span style="font-family: arial;">Tax @ 5.75%</span></td>
            <td width="54%">$${tax.toFixed(2)}</td>
        </tr>
        <tr>
            <td style="text-align: center;" colspan="3" width="67%"><strong>Total</strong></td>
            <td width="54%"><strong>$${total.toFixed(2)}</strong></td>
        </tr>
    </tbody>
    </table>`
    );
}

//product rows
function setProductRows(){
    for (let i = 0; i < products.length; i++){
        $("#tab").append(`
            <tr>
                <td width="43%">${products[i].item}</td>
                <td align="center" width="11%">${products[i].quantity}</td>
                <td width="13%">$${products[i].price}</td>
                <td width="54%">$${ext_prices[i]}</td>
            </tr>`);
    }
}
*/