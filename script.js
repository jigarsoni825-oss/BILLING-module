// Set Today's Date
document.getElementById('currDate').innerText = new Date().toLocaleDateString();

function addItem() {
    const name = document.getElementById('itemName').value;
    const imei = document.getElementById('itemIMEI').value;
    const fullPrice = parseFloat(document.getElementById('itemPrice').value);

    if(!name || !fullPrice) return alert("Enter Item and Price!");

    // Math: Reverse GST (18%)
    const basic = fullPrice / 1.18;
    const totalGst = fullPrice - basic;
    const gstEach = totalGst / 2;

    // Update Customer Display
    document.getElementById('outCustName').innerText = document.getElementById('custName').value || "---";
    document.getElementById('outCustMobile').innerText = document.getElementById('custMobile').value || "---";

    // Add Row to Table
    const tableBody = document.getElementById('billBody');
    const row = `<tr>
        <td>MODEL: ${name}<br>IMEI: ${imei}</td>
        <td>1</td>
        <td>${basic.toFixed(2)}</td>
        <td>${fullPrice.toFixed(2)}</td>
    </tr>`;
    tableBody.innerHTML += row;

    // Update Totals
    document.getElementById('basicAmt').innerText = basic.toFixed(2);
    document.getElementById('cgstAmt').innerText = gstEach.toFixed(2);
    document.getElementById('sgstAmt').innerText = gstEach.toFixed(2);
    document.getElementById('totalAmt').innerText = fullPrice.toFixed(2);
}
