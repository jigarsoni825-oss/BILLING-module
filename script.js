let currentItems = [];

// Tab Navigation
function switchTab(tab) {
    document.getElementById('newBillSection').style.display = tab === 'newBill' ? 'block' : 'none';
    document.getElementById('historySection').style.display = tab === 'history' ? 'block' : 'none';
    document.getElementById('tab-new').className = tab === 'newBill' ? 'tab-btn active' : 'tab-btn';
    document.getElementById('tab-hist').className = tab === 'history' ? 'tab-btn active' : 'tab-btn';
    if(tab === 'history') showHistory();
}

function toggleCredit() {
    document.getElementById('creditInputs').style.display = document.getElementById('payMode').value === 'CREDIT' ? 'block' : 'none';
}

function addItem() {
    const item = {
        name: document.getElementById('inItem').value,
        imei: document.getElementById('inIMEI').value,
        total: parseFloat(document.getElementById('inPrice').value) || 0
    };
    if(item.name && item.total) {
        currentItems.push(item);
        document.getElementById('inItem').value = '';
        document.getElementById('inIMEI').value = '';
        document.getElementById('inPrice').value = '';
        renderBills(); // Preview bill
        alert("Item Added! You can add another or click Save & Print.");
    } else {
        alert("Please enter Model Name and Price.");
    }
}

function renderBills() {
    const name = document.getElementById('inCustName').value || "________________";
    const mob = document.getElementById('inCustMob').value || "________________";
    const billNo = document.getElementById('inBillNo').value || "K---";
    const date = new Date().toLocaleDateString('en-GB');
    const payMode = document.getElementById('payMode').value;
    
    let grandTotal = currentItems.reduce((a,b) => a + b.total, 0);
    let paidAmt = grandTotal;
    let dueAmt = 0;
    let dueText = "";

    if(payMode === 'CREDIT') {
        paidAmt = parseFloat(document.getElementById('amtPaid').value) || 0;
        dueAmt = grandTotal - paidAmt;
        dueText = `<br><b style="color:red;">DUE: ₹${dueAmt}</b> | Date: ${document.getElementById('dueDate').value}`;
    }

    const billHTML = (type) => `
    <div class="bill-copy">
        <div class="copy-label">${type}</div>
        <h3 class="tax-title">TAX INVOICE</h3>
        <div class="header">
            <div class="h-left">MOBILE PHONE<br>MEMORY CARDS<br>HOME APPLIANCES</div>
            <div class="h-mid">
                <div class="brand">KEVAL MOBILE ZONE</div>
                <div class="addr">NEW S.T. DEPOT NR KRISHNA TALKIES PADRA</div>
                <div class="gst">GST TIN: 24ANHPT4225G1Z1</div>
            </div>
            <div class="h-right">9909903566<br>8909936875<br>9825544515</div>
        </div>
        <div class="cust-info">
            <div class="ci-left"><b>NAME:</b> ${name}<br><b>ADDRESS:</b> PADRA<br><b>MOBILE:</b> ${mob}</div>
            <div class="ci-right"><b>BILL NO:</b> ${billNo}<br><b>DATE:</b> ${date}</div>
        </div>
        <table class="items-table">
            <thead><tr><th>PARTICULARS</th><th>QTY</th><th>RATE</th><th>AMOUNT</th></tr></thead>
            <tbody>
                ${currentItems.map(i => `<tr><td>MODEL: ${i.name}<br>IMEI: ${i.imei}</td><td>1</td><td>${(i.total/1.18).toFixed(2)}</td><td>${i.total.toFixed(2)}</td></tr>`).join('')}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="2" class="note-box" contenteditable="true">
                        <b>PAY MODE: ${payMode}</b><br>PAID: ₹${paidAmt} ${dueText}
                    </td>
                    <td class="lbl">BASIC</td><td class="val">${(grandTotal/1.18).toFixed(2)}</td>
                </tr>
                <tr><td colspan="2"></td><td class="lbl">CGST (9%)</td><td class="val">${(grandTotal*0.09/1.18).toFixed(2)}</td></tr>
                <tr><td colspan="2"></td><td class="lbl">SGST (9%)</td><td class="val">${(grandTotal*0.09/1.18).toFixed(2)}</td></tr>
                <tr><td colspan="2"></td><td class="lbl" style="font-size:14px;">TOTAL</td><td class="val" style="font-size:14px;">₹${grandTotal.toFixed(2)}</td></tr>
            </tfoot>
        </table>
        <div class="rules" contenteditable="true">
            <b>ખાસ સુચના:-</b><br>• મોબાઈલ ની વોરંટી કંપની ના નિયમો મુજબ રહેશે. બિલ વગર વોરંટી મળશે નહિ.<br>• મોબાઈલ માં પાણી જવાથી કે પડી જવાથી ડેમેજ ની જવાબદારી રહેશે નહિ.
        </div>
        <div class="footer"><span>CUSTOMER SIGNATURE</span><span>KEVAL MOBILE ZONE</span></div>
    </div>`;

    document.getElementById('print-page').innerHTML = billHTML("CUSTOMER COPY") + "<div class='page-divider'></div>" + billHTML("SHOP COPY");
}

function saveAndPrint() {
    if(currentItems.length === 0) return alert("Please add an item before saving.");
    
    // Save to LocalStorage Database
    const db = JSON.parse(localStorage.getItem('kmz_db')) || [];
    const grandTotal = currentItems.reduce((a,b) => a + b.total, 0);
    const payMode = document.getElementById('payMode').value;
    const due = payMode === 'CREDIT' ? (grandTotal - (parseFloat(document.getElementById('amtPaid').value)||0)) : 0;

    const record = {
        id: Date.now(), // Unique ID
        billNo: document.getElementById('inBillNo').value || "Auto",
        name: document.getElementById('inCustName').value,
        total: grandTotal,
        due: due,
        date: new Date().toLocaleDateString('en-GB')
    };

    db.push(record);
    localStorage.setItem('kmz_db', JSON.stringify(db));
    
    window.print(); // Triggers the print dialog
    
    // Reset after print
    currentItems = []; 
    document.getElementById('inBillNo').value = '';
    document.getElementById('inCustName').value = '';
    document.getElementById('inCustMob').value = '';
}

// LEDGER / HISTORY FUNCTIONS
function showHistory() {
    const db = JSON.parse(localStorage.getItem('kmz_db')) || [];
    const list = document.getElementById('billList');
    
    // Calculate Tally
    let totalSales = 0;
    let totalPending = 0;
    
    let html = '<table class="history-table"><tr><th>Bill</th><th>Customer</th><th>Total</th><th>Due</th><th>Action</th></tr>';
    
    db.reverse().forEach((b) => {
        totalSales += b.total;
        totalPending += b.due;
        
        let actionBtn = b.due > 0 
            ? `<button onclick="markPaid(${b.id})" class="btn-sm-green">Mark Paid</button>` 
            : `<span style="color:green; font-weight:bold;">✔ Settled</span>`;

        html += `<tr>
            <td>${b.billNo}</td>
            <td>${b.name}<br><small>${b.date}</small></td>
            <td>₹${b.total}</td>
            <td style="color:${b.due > 0 ? 'red' : 'black'};"><b>₹${b.due}</b></td>
            <td>${actionBtn}</td>
        </tr>`;
    });
    
    html += '</table>';
    list.innerHTML = db.length ? html : "<p>No bills generated yet.</p>";
    
    document.getElementById('tallyTotal').innerText = `₹${totalSales.toFixed(2)}`;
    document.getElementById('tallyPending').innerText = `₹${totalPending.toFixed(2)}`;
}

function markPaid(id) {
    if(!confirm("Are you sure you received the pending amount?")) return;
    
    let db = JSON.parse(localStorage.getItem('kmz_db')) || [];
    db = db.map(b => {
        if(b.id === id) b.due = 0; // Clear the debt
        return b;
    });
    localStorage.setItem('kmz_db', JSON.stringify(db));
    showHistory(); // Refresh the list
}
