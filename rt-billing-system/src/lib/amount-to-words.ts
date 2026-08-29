const units = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function numberToWords(n: number): string {
  if (n < 0) return 'Minus ' + numberToWords(-n);
  if (n === 0) return '';
  if (n < 20) return units[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
  if (n < 1000) return units[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + numberToWords(n % 100) : '');
  if (n < 1000000) return numberToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + numberToWords(n % 1000) : '');
  if (n < 1000000000) return numberToWords(Math.floor(n / 1000000)) + ' Million' + (n % 1000000 !== 0 ? ' ' + numberToWords(n % 1000000) : '');
  return n.toString();
}

export function kwdToWordsEn(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num) || num === 0) return 'Zero Kuwaiti Dinars only.';

  const dinars = Math.floor(num);
  const fils = Math.round((num - dinars) * 1000);

  let result = '';

  if (dinars > 0) {
    result += numberToWords(dinars) + (dinars === 1 ? ' Kuwaiti Dinar' : ' Kuwaiti Dinars');
  }

  if (fils > 0) {
    if (result.length > 0) result += ' and ';
    result += numberToWords(fils) + (fils === 1 ? ' Fils' : ' Fils');
  }

  return (result + ' only.').trim();
}

export function kwdToWordsAr(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num) || num === 0) return 'صفر دينار كويتي فقط.';

  const dinars = Math.floor(num);
  const fils = Math.round((num - dinars) * 1000);

  let result = '';

  if (dinars > 0) {
    result += `${dinars} دينار كويتي`;
  }

  if (fils > 0) {
    if (result.length > 0) result += ' و ';
    result += `${fils} فلس`;
  }

  return (result + ' فقط.').trim();
}
