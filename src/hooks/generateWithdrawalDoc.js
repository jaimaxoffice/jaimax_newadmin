import { saveAs } from 'file-saver';

// ─── Number to Words (Indian Format) ────────────────────────────
const ones = [
  '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen'
];
const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function belowHundred(n) {
  if (n < 20) return ones[n];
  return tens[Math.floor(n / 10)] + (n % 10 ? '-' + ones[n % 10] : '');
}

function belowThousand(n) {
  if (n < 100) return belowHundred(n);
  return ones[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' and ' + belowHundred(n % 100) : '');
}

function toWordsIndian(num) {
  if (num === 0) return 'zero';
  let r = '';
  if (num >= 10000000) { r += belowThousand(Math.floor(num / 10000000)) + ' crore '; num %= 10000000; }
  if (num >= 100000) { r += belowHundred(Math.floor(num / 100000)) + ' lakh '; num %= 100000; }
  if (num >= 1000) { r += belowHundred(Math.floor(num / 1000)) + ' thousand '; num %= 1000; }
  if (num > 0) r += belowThousand(num);
  return r.trim();
}

function amountToWords(amount) {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  let w = toWordsIndian(rupees) + ' rupees';
  if (paise > 0) w += ' and ' + toWordsIndian(paise) + ' paise';
  return w.charAt(0).toUpperCase() + w.slice(1);
}

// ─── Date Helpers ────────────────────────────────────────────────
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function ordinal(d) {
  if (d > 3 && d < 21) return 'th';
  switch (d % 10) { case 1: return 'st'; case 2: return 'nd'; case 3: return 'rd'; default: return 'th'; }
}

function dateLong(date) {
  const d = date.getDate();
  return `${d}${ordinal(d)} ${MONTHS[date.getMonth()]}, ${date.getFullYear()}`;
}

function dateShort(date) {
  return `${String(date.getDate()).padStart(2,'0')}.${String(date.getMonth()+1).padStart(2,'0')}.${date.getFullYear()}`;
}

export function getFinancialYear() {
  const now = new Date();
  const y = now.getFullYear();
  return now.getMonth() >= 3 ? `${y}-${String(y+1).slice(-2)}` : `${y-1}-${String(y).slice(-2)}`;
}

// ─── Total Calculator ────────────────────────────────────────────
function calcTotal(data) {
  return data.reduce((s, item) => {
    const a = parseFloat(item.amount?.$numberDecimal || item.amount) || 0;
    const c = parseFloat(item.admin_inr_charges?.$numberDecimal || item.admin_inr_charges) || 0;
    return s + (a - c);
  }, 0);
}

// ─── Generate & Download Word Document ───────────────────────────
export function downloadWithdrawalDoc({ data, bankType, chequeNumber, refNumber, date }) {
  const total = calcTotal(data);
  const d = date ? new Date(date) : new Date();
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  const dLong = dateLong(d);
  const dShort = dateShort(d);
  const ref = refNumber || `JSS/MTN/${getFinancialYear()}/01`;
  const words = amountToWords(total);
  const label = bankType === 'HDFC' ? 'HDFC BANK' : 'OTHER BANK';

  const rows = data.map((item, i) => {
    const a = parseFloat(item.amount?.$numberDecimal || item.amount) || 0;
    const c = parseFloat(item.admin_inr_charges?.$numberDecimal || item.admin_inr_charges) || 0;
    const net = (a - c).toFixed(2);
    return `<tr>
      <td style="padding:5px 8px;text-align:center;border:1px solid #000;font-size:8pt;">${i+1}</td>
      <td style="padding:5px 8px;text-align:center;border:1px solid #000;font-size:8pt;">${item.userId?.name||'N/A'}</td>
      <td style="padding:5px 8px;text-align:center;border:1px solid #000;font-size:8pt;">${item.kycInfo?.bank_name||'N/A'}</td>
      <td style="padding:5px 8px;text-align:center;border:1px solid #000;font-size:8pt;">${item.kycInfo?.ifsc_code||'N/A'}</td>
      <td style="padding:5px 8px;text-align:center;border:1px solid #000;font-size:8pt;">${item.kycInfo?.bank_account||'N/A'}</td>
      <td style="padding:5px 8px;text-align:right;border:1px solid #000;font-size:8pt;">${net}</td>
    </tr>`;
  }).join('');

  const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>${label} Withdrawal</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]-->
<style>
@page{
  size:A4;
  margin-top:5px;       /* 3cm header */
  margin-right:0.8in;
  margin-bottom:1in;
  margin-left:0.8in;
}
body{
  font-family:'Times New Roman',Times,serif;
  font-size:12pt;
  line-height:1.8;
  color:#000;
}
p{margin:3px 0;}
table{border-collapse:collapse;width:100%;}
.sig-space{height:20px;}
</style>
</head>
<body>

<!-- ═══ PAGE 1: COVER LETTER ═══ -->
<div style="margin-top:20px">
<p style="margin-bottom:0;"><b>Ref: ${ref}</b></p>
<p style="margin-top:0;"><b>Date: ${dLong}</b></p>
<br/>
<p>To,</p>
<p>The Manager</p>
<p>HDFC Bank Limited</p>
<p>Kavuri Hills, Madhapur Branch</p>
<p>Hyderabad</p>
<br/>
<p><b><u>Sub: Remittance of Maintenance Amount for Jaisvik Software Maintenance for the Month of <b>${month}, ${year}</b> – Reg.</u></b></p>
<br/>
<p>Dear Sir,</p>
<br/>
<p style="text-align:justify;">With reference to the subject cited above, we wish to inform you regarding the remittance of Maintenance Amount for the month of <b>${month}, ${year}</b> to our employees.</p>
<br/>
<p style="text-align:justify;">We are here with enclosing Cheque No. <b>${chequeNumber||'______'}</b> dated ${dShort} for an amount of <b>Rs. ${total.toFixed(2)}/-</b>(<b>${words}</b>.).</p>
<br/>
<p style="text-align:justify;">We are also enclosing the break-up of individual maintenance amounts for your kind reference.</p>
<br/>
<p style="text-align:justify;">We kindly request you to credit the maintenance amounts to our employees' respective accounts on or before <b>${dShort}</b> and acknowledge receipt of the same.</p>
<br/>
<p>Thanking you.</p>
<br/><br/>
<p>Yours truly,</p>
<p>For Jaisvik Software Solutions Pvt. Ltd.,</p>
<div class="sig-space"></div>
<p><b>Amar Kumar K</b></p>
<p>CEO</p>
<br/>
<p><i>Encl: As stated above</i></p>
</div>

<!-- ═══ MS WORD PAGE BREAK ═══ -->
<br clear=all style='mso-special-character:line-break;page-break-before:always'>

<!-- ═══ PAGE 2: TITLE + TABLE (same page) ═══ -->
<p style="text-align:center;font-size:13pt;font-weight:bold;">Please find the attached sheet below for Amount transfer OF ${label}</p>
<p style="text-align:center;font-size:13pt;font-weight:bold;">JAISVIK SOFTWARE SOLUTIONS PVT. LTD.</p>
<p style="text-align:center;font-size:13pt;font-weight:bold;">HYDERABAD</p>
<br/>
<table>
<thead>
<tr style="background:#d9d9d9;">
<th style="padding:8px;text-align:center;border:2px solid #000;font-size:6pt;width:5%;">S.No</th>
<th style="padding:8px;text-align:center;border:2px solid #000;font-size:6pt;width:25%;">NAME OF THE ACCOUNT HOLDER</th>
<th style="padding:8px;text-align:center;border:2px solid #000;font-size:6pt;width:18%;">BANK NAME</th>
<th style="padding:8px;text-align:center;border:2px solid #000;font-size:6pt;width:14%;">IFSC CODE</th>
<th style="padding:8px;text-align:center;border:2px solid #000;font-size:6pt;width:20%;">ACCOUNT NUMBER</th>
<th style="padding:8px;text-align:center;border:2px solid #000;font-size:6pt;width:13%;">AMOUNT Rs.</th>
</tr>
</thead>
<tbody>
${rows}
<tr style="">
<td colspan="5" style="text-align:right;padding:8px;border:2px solid #000;font-weight:bold;font-size:8pt;">Total=</td>
<td style="text-align:right;padding:8px;border:2px solid #000;font-weight:bold;font-size:8pt;">${total.toFixed(2)}</td>
</tr>
</tbody>
</table>

</body></html>`;

  const blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
  saveAs(blob, `${bankType}_Withdrawal_${dShort.replace(/\./g, '-')}.doc`);
}