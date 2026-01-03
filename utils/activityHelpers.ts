import { ActivityPart } from '../types/activity';

export const getActivityTitle = (type: string, message: string): string => {
  const upperType = type?.toUpperCase();
  const lowerMsg = message?.toLowerCase() || '';
  
  if (upperType === 'TAMBAH') return 'PRODUK BARU';
  if (upperType === 'MASUK' || upperType === 'IN') return 'STOK MASUK';
  if (upperType === 'KELUAR' || upperType === 'OUT') {
    return (lowerMsg.includes('penjualan') || lowerMsg.includes('trx')) ? 'PENJUALAN' : 'STOK KELUAR';
  }
  if (upperType === 'UPDATE') return 'UPDATE DATA';
  return 'AKTIVITAS';
};

export const formatActivityMessage = (message: string): ActivityPart[] => {
  if (!message) return [{ text: '', styleType: 'normal' }];

  // Bersihkan karakter kutip miring dari iOS/Android dan simbol @
  const cleanedMessage = message
    .replace(/@/g, 'seharga')
    .replace(/[\u201C\u201D]/g, '"'); 

  const allMatches: any[] = [];
  
  const patterns = [
    // Produk: Menangkap teks di DALAM tanda kutip saja
    { regex: /"([^"]+)"/g, type: 'product' },
    // Harga: Menangkap format Rp
    { regex: /Rp\s?[\d.,]+/gi, type: 'price' },
    // Qty: Menangkap angka + unit secara presisi
    { regex: /\b\d+\s+unit\b/gi, type: 'qty' }
  ];

  patterns.forEach(p => {
    let match;
    p.regex.lastIndex = 0;
    while ((match = p.regex.exec(cleanedMessage)) !== null) {
      allMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        // Jika produk, tampilkan isinya saja tanpa tanda kutip
        text: p.type === 'product' ? match[1] : match[0],
        type: p.type,
      });
    }
  });

  // Urutkan dan filter overlap agar tidak terjadi tabrakan regex
  allMatches.sort((a, b) => a.start - b.start);
  
  const filteredMatches: any[] = [];
  let lastEnd = 0;
  allMatches.forEach((match) => {
    if (match.start >= lastEnd) {
      filteredMatches.push(match);
      lastEnd = match.end;
    }
  });
  
  const parts: ActivityPart[] = [];
  lastEnd = 0;

  filteredMatches.forEach((match) => {
    if (match.start > lastEnd) {
      parts.push({ 
        text: cleanedMessage.substring(lastEnd, match.start), 
        styleType: 'normal' 
      });
    }
    
    parts.push({ 
      text: match.text, 
      styleType: match.type as any 
    });
    
    lastEnd = match.end;
  });

  if (lastEnd < cleanedMessage.length) {
    parts.push({ 
      text: cleanedMessage.substring(lastEnd), 
      styleType: 'normal' 
    });
  }
  
  return parts.length > 0 ? parts : [{ text: cleanedMessage, styleType: 'normal' }];
};