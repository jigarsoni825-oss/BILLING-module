let currentItems = [];

function initSystem() {
    const defaultRules = `ખાસ સુચના:-\n૧. મોબાઈલ ની વોરંટી ના નિયમો મુજબ, જે તે કંપની ના સર્વિસ સ્ટેશન દ્વારા પતાવાની રહેશે.\n૨. વોરંટી માટે બિલ ની કોપી સાથે રાખવી અનિવાર્ય છે.\n૩. નવી ખામી વાળા ભાગો બિલ વગર બદલી આપવામાં આવશે નહિ.\n૪. મોબાઈલ માં પાણી જવાથી કે મોબાઈલ પડી જવાથી વાંક થવાની જવાબદારી રહેશે નહિ.\n૫. ખરાબ થયેલ મોબાઈલ બિલ વગર કોઈ પણ સંજોગોમાં બદલી કે પાછો લેવામાં આવશે નહિ.\nવોરંટી ના નિયમો:-\n૧. ફોન ના ડબ્બા માં IMEI નંબર હોવો ફરજીયાત છે. નહિ તો કોઈ વોરંટી મળશે નહિ.\n૨. વોરંટી દરમિયાન સ્ક્રીન તૂટવાની જવાબદારી કોઈ પણ સંજોગોમાં રહેશે નહિ.`;
    if(!localStorage.getItem('kmz_rules')) localStorage.setItem('kmz_rules', defaultRules);
    document.getElementById('rulesInput').value = localStorage.getItem('kmz_rules');
    generateBillNumber();
}

function generateBillNumber() {
    const d = new Date();
    const dateNum = String(d.getDate()).padStart(2, '0');
    const monthChar = d.toLocaleString('en-US', { month: 'short' })[0].toUpperCase(); 
    const todayStr = d.toDateString();
    const db = JSON.parse(localStorage.getItem('kmz_db')) || [];
    const todaysBills = db.filter(b => b.dateStr === todayStr).length;
    document.getElementById('inBillNo').value = `K${dateNum}${monthChar}${todaysBills + 1}`;
}

function switchTab(tab) {
    document.getElementById('newBillSection').style.display = tab === 'newBill' ? 'block' : 'none';
    document.getElementById('historySection').style.display = tab === 'history' ? 'block' : 'none';
    document.getElementById('settingsSection').style.display = tab === 'settings' ? 'block' : 'none';
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if(tab === 'newBill') document.getElementById('tab-new').classList.add('active');
    if(tab === 'history') { document.getElementById('tab-hist').classList.add('active'); showHistory(); }
    if(tab === 'settings') document.getElementById('tab-set').classList.add('active');
}

function saveRules() {
    localStorage.setItem('kmz_rules', document.getElementById('rulesInput').value);
    alert("Rules updated successfully!");
}

function toggleCredit() {
    document.getElementById('creditInputs').style.display = document.getElementById('payMode').value === 'CREDIT' ? 'block' : 'none';
}

function addItem() {
    const item = { name: document.getElementById('inItem').value, imei: document.getElementById('inIMEI').value, total: parseFloat(document.getElementById('inPrice').value) || 0 };
    if(item.name && item.total) {
        currentItems.push(item);
        document.getElementById('inItem').value = ''; document.getElementById('inIMEI').value = ''; document.getElementById('inPrice').value = '';
        alert("Item added. Add another or hit Save & Print.");
    }
}

// Function to generate the HTML for a bill (Used for both New Bills and Reprints)
function generateBillHTML(type, billData) {
    const rulesText = localStorage.getItem('kmz_rules').replace(/\n/g, '<br>');
    let dueText = billData.due > 0 ? `| <b style="color:black;">DUE: ₹${billData.due}</b>` : '';

    return `
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
            <div class="ci-left"><b>NAME:</b> ${billData.name}<br><b>ADDRESS:</b> ${billData.address}<br><b>MOBILE:</b> ${billData.mobile}</div>
            <div class="ci-right"><b>BILL NO:</b> ${billData.billNo}<br><b>DATE:</b> ${billData.date}</div>
        </div>
        <table class="items-table">
            <thead><tr><th>PARTICULARS</th><th>QTY</th><th>RATE</th><th>AMOUNT</th></tr></thead>
            <tbody>
                ${billData.items.map(i => `<tr><td>MODEL: ${i.name}<br>IMEI: ${i.imei}</td><td>1</td><td>${(i.total/1.18).toFixed(2)}</td><td>${i.total.toFixed(2)}</td></tr>`).join('')}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="2" class="note-box">
                        <b>PAY MODE: ${billData.payMode}</b><br>
                        ${billData.payMode === 'CREDIT' ? `PAID: ₹${billData.paid} ${dueText}` : ''}
                    </td>
                    <td class="lbl">BASIC</td><td class="val">${(billData.total/1.18).toFixed(2)}</td>
                </tr>
                <tr><td colspan="2"></td><td class="lbl">CGST (9%)</td><td class="val">${(billData.total*0.09/1.18).toFixed(2)}</td></tr>
                <tr><td colspan="2"></td><td class="lbl">SGST (9%)</td><td class="val">${(billData.total*0.09/1.18).toFixed(2)}</td></tr>
                <tr><td colspan="2"></td><td class="lbl" style="font-size:14px;">TOTAL</td><td class="val" style="font-size:14px;">₹${billData.total.toFixed(2)}</td></tr>
            </tfoot>
        </table>
        <div class="rules-box">${rulesText}</div>
        <div class="footer"><span>CUSTOMER SIGNATURE</span><span>KEVAL MOBILE ZONE</span></div>
    </div>`;
}

function saveAndPrint() {
    if(currentItems.length === 0) return alert("Add items first.");
    
    const db = JSON.parse(localStorage.getItem('kmz_db')) || [];
    const grandTotal = currentItems.reduce((a,b) => a + b.total, 0);
    const payMode = document.getElementById('payMode').value;
    const paid = payMode === 'CREDIT' ? (parseFloat(document.getElementById('amtPaid').value)||0) : grandTotal;
    
    const newBill = {
        id: Date.now(),
        billNo: document.getElementById('inBillNo').value,
        name: document.getElementById('inCustName').value || "________________",
        mobile: document.getElementById('inCustMob').value || "________________",
        address: document.getElementById('inCustAddr').value || "Padra",
        note: document.getElementById('inInternalNote').value || "",
        items: [...currentItems], // Saves the exact items
        total: grandTotal,
        payMode: payMode,
        paid: paid,
        due: grandTotal - paid,
        dateStr: new Date().toDateString(),
        date: new Date().toLocaleDateString('en-GB')
    };

    db.push(newBill);
    localStorage.setItem('kmz_db', JSON.stringify(db));

    // Render & Print
    document.getElementById('print-page').innerHTML = generateBillHTML("CUSTOMER COPY", newBill) + "<div class='page-divider'></div>" + generateBillHTML("SHOP COPY", newBill);
    window.print();
    
    // Clear Form
    currentItems = []; 
    document.getElementById('inCustName').value = '';
    document.getElementById('inCustMob').value = '';
    document.getElementById('inInternalNote').value = '';
    generateBillNumber();
}

// HISTORY - FULL DETAILS, REPRINT, & DELETE
function showHistory() {
    const db = JSON.parse(localStorage.getItem('kmz_db')) || [];
    let html = '';
    
    db.reverse().forEach(b => {
        let itemsList = b.items.map(i => `${i.name} (₹${i.total})`).join(', ');
        let noteHTML = b.note ? `<div style="background:#fff3cd; padding:5px; font-size:11px; margin-top:5px; border-left:3px solid #ffc107;"><b>Note:</b> ${b.note}</div>` : '';
        
        html += `
        <div style="border:1px solid #ddd; background:#fff; padding:10px; margin-bottom:10px; border-radius:5px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                <strong>${b.billNo} - ${b.name}</strong>
                <span style="color:${b.due > 0 ? 'red' : 'green'}; font-weight:bold;">₹${b.total} ${b.due > 0 ? `(Due: ₹${b.due})` : '(Paid)'}</span>
            </div>
            <div style="font-size:12px; color:#555;">
                <b>Items:</b> ${itemsList}<br>
                <b>Address:</b> ${b.address} | <b>Mobile:</b> ${b.mobile} | <b>Date:</b> ${b.date}
            </div>
            ${noteHTML}
            <div style="margin-top:10px; display:flex; gap:10px;">
                <button onclick="reprintBill(${b.id})" class="btn-sm-blue">🖨️ Reprint</button>
                <button onclick="deleteBill(${b.id})" class="btn-sm-red">🗑️ Delete</button>
            </div>
        </div>`;
    });
    document.getElementById('billList').innerHTML = db.length ? html : "<p>No bills found.</p>";
}

function reprintBill(id) {
    const db = JSON.parse(localStorage.getItem('kmz_db')) || [];
    const billToPrint = db.find(b => b.id === id);
    if(billToPrint) {
        document.getElementById('print-page').innerHTML = generateBillHTML("CUSTOMER COPY (DUPLICATE)", billToPrint) + "<div class='page-divider'></div>" + generateBillHTML("SHOP COPY (DUPLICATE)", billToPrint);
        window.print();
    }
}

function deleteBill(id) {
    if(confirm("Permanently delete this bill? This cannot be undone.")) {
        let db = JSON.parse(localStorage.getItem('kmz_db')) || [];
        db = db.filter(b => b.id !== id);
        localStorage.setItem('kmz_db', JSON.stringify(db));
        showHistory(); // Refresh
        generateBillNumber(); // Recalculate sequence
    }
}

function syncToGoogleSheets() {
    alert("Ready to link. Need the Google App Script Web URL.");
}
