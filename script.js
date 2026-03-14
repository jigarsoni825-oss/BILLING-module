let currentItems = [];

// Initialize System on Load
function initSystem() {
    // Load Default Rules if none exist
    const defaultRules = `ખાસ સુચના:-
૧. મોબાઈલ ની વોરંટી ના નિયમો મુજબ, જે તે કંપની ના સર્વિસ સ્ટેશન દ્વારા પતાવાની રહેશે.
૨. વોરંટી માટે બિલ ની કોપી સાથે રાખવી અનિવાર્ય છે.
૩. નવી ખામી વાળા ભાગો બિલ વગર બદલી આપવામાં આવશે નહિ.
૪. મોબાઈલ માં પાણી જવાથી કે મોબાઈલ પડી જવાથી વાંક થવાની જવાબદારી રહેશે નહિ.
૫. ખરાબ થયેલ મોબાઈલ બિલ વગર કોઈ પણ સંજોગોમાં બદલી કે પાછો લેવામાં આવશે નહિ.
વોરંટી ના નિયમો:-
૧. ફોન ના ડબ્બા માં IMEI નંબર હોવો ફરજીયાત છે. નહિ તો કોઈ વોરંટી મળશે નહિ.
૨. વોરંટી દરમિયાન સ્ક્રીન તૂટવાની જવાબદારી કોઈ પણ સંજોગોમાં રહેશે નહિ.`;
    
    if(!localStorage.getItem('kmz_rules')) {
        localStorage.setItem('kmz_rules', defaultRules);
    }
    document.getElementById('rulesInput').value = localStorage.getItem('kmz_rules');
    generateBillNumber();
}

// Auto Bill Number Logic (e.g., K15M1)
function generateBillNumber() {
    const d = new Date();
    const dateNum = String(d.getDate()).padStart(2, '0');
    const monthChar = d.toLocaleString('en-US', { month: 'short' })[0].toUpperCase(); // 'M' for March
    const todayStr = d.toDateString();

    const db = JSON.parse(localStorage.getItem('kmz_db')) || [];
    // Count how many bills were made TODAY
    const todaysBills = db.filter(b => b.dateStr === todayStr).length;
    const nextSeq = todaysBills + 1;

    document.getElementById('inBillNo').value = `K${dateNum}${monthChar}${nextSeq}`;
}

// Tab Switching
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
    alert("Rules updated! They will appear on all future prints.");
}

function toggleCredit() {
    document.getElementById('creditInputs').style.display = document.getElementById('payMode').value === 'CREDIT' ? 'block' : 'none';
}

function addItem() {
    const item = { name: document.getElementById('inItem').value, imei: document.getElementById('inIMEI').value, total: parseFloat(document.getElementById('inPrice').value) || 0 };
    if(item.name && item.total) {
        currentItems.push(item);
        document.getElementById('inItem').value = ''; document.getElementById('inIMEI').value = ''; document.getElementById('inPrice').value = '';
        renderBills(); 
    }
}

// Build the Print Layout
function renderBills() {
    const name = document.getElementById('inCustName').value || "________________";
    const mob = document.getElementById('inCustMob').value || "________________";
    const billNo = document.getElementById('inBillNo').value;
    const date = new Date().toLocaleDateString('en-GB');
    const payMode = document.getElementById('payMode').value;
    const rulesText = localStorage.getItem('kmz_rules').replace(/\n/g, '<br>'); // Convert newlines to HTML breaks
    
    let grandTotal = currentItems.reduce((a,b) => a + b.total, 0);
    let paidAmt = payMode === 'CREDIT' ? (parseFloat(document.getElementById('amtPaid').value) || 0) : grandTotal;
    let dueAmt = grandTotal - paidAmt;

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
                    <td colspan="2" class="note-box">
                        <b>PAY MODE: ${payMode}</b><br>
                        ${payMode === 'CREDIT' ? `PAID: ₹${paidAmt} | <b style="color:black;">DUE: ₹${dueAmt}</b>` : ''}
                    </td>
                    <td class="lbl">BASIC</td><td class="val">${(grandTotal/1.18).toFixed(2)}</td>
                </tr>
                <tr><td colspan="2"></td><td class="lbl">CGST (9%)</td><td class="val">${(grandTotal*0.09/1.18).toFixed(2)}</td></tr>
                <tr><td colspan="2"></td><td class="lbl">SGST (9%)</td><td class="val">${(grandTotal*0.09/1.18).toFixed(2)}</td></tr>
                <tr><td colspan="2"></td><td class="lbl" style="font-size:14px;">TOTAL</td><td class="val" style="font-size:14px;">₹${grandTotal.toFixed(2)}</td></tr>
            </tfoot>
        </table>
        
        <div class="rules-box">
            ${rulesText}
        </div>
        
        <div class="footer"><span>CUSTOMER SIGNATURE</span><span>KEVAL MOBILE ZONE</span></div>
    </div>`;

    document.getElementById('print-page').innerHTML = billHTML("CUSTOMER COPY") + "<div class='page-divider'></div>" + billHTML("SHOP COPY");
}

function saveAndPrint() {
    if(currentItems.length === 0) return alert("Add items first.");
    
    const db = JSON.parse(localStorage.getItem('kmz_db')) || [];
    const grandTotal = currentItems.reduce((a,b) => a + b.total, 0);
    const payMode = document.getElementById('payMode').value;
    const due = payMode === 'CREDIT' ? (grandTotal - (parseFloat(document.getElementById('amtPaid').value)||0)) : 0;

    db.push({
        id: Date.now(),
        billNo: document.getElementById('inBillNo').value,
        name: document.getElementById('inCustName').value,
        mobile: document.getElementById('inCustMob').value,
        total: grandTotal,
        payMode: payMode,
        due: due,
        dateStr: new Date().toDateString(),
        date: new Date().toLocaleDateString('en-GB')
    });

    localStorage.setItem('kmz_db', JSON.stringify(db));
    window.print();
    
    currentItems = []; 
    document.getElementById('inCustName').value = '';
    document.getElementById('inCustMob').value = '';
    generateBillNumber(); // Setup next bill number
}

function showHistory() {
    const db = JSON.parse(localStorage.getItem('kmz_db')) || [];
    let html = '<table class="history-table"><tr><th>Bill No</th><th>Customer</th><th>Total</th><th>Due</th></tr>';
    db.reverse().forEach(b => {
        html += `<tr><td>${b.billNo}</td><td>${b.name}<br>${b.mobile}</td><td>₹${b.total}</td><td style="color:${b.due > 0 ? 'red' : 'green'};">₹${b.due}</td></tr>`;
    });
    document.getElementById('billList').innerHTML = html + '</table>';
}

// Google Sheets Prep
function syncToGoogleSheets() {
    alert("Google Sheets Sync requires a Web App URL. Let's set that up next!");
}
