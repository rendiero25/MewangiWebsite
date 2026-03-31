const badWords = [
  // Standar Bahasa Indonesia (Contoh beberapa)
  'anjing', 'babi', 'monyet', 'kunyuk', 'bangsat', 'brengsek', 'tolol', 'goblok',
  'idiot', 'puki', 'kontol', 'memek', 'ngentot', 'perek', 'jablay', 'bajingan',
  'asu', 'ancuk', 'cok', 'jancuk', 'pantek', 'itil', 'bejat', 'keparat',
  // Standar Bahasa Inggris (Contoh beberapa)
  'fuck', 'shit', 'asshole', 'bitch', 'cunt', 'dick', 'pussy', 'whore', 'bastard'
];

/**
 * Filter kata-kata kasar dari teks
 * Mengganti kata kasar dengan bintang (*)
 */
const filterBadWords = (text) => {
  if (!text) return text;
  
  let formattedText = text;
  badWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    formattedText = formattedText.replace(regex, '*'.repeat(word.length));
  });
  
  return formattedText;
};

/**
 * Cek apakah teks mengandung kata kasar
 */
const hasBadWords = (text) => {
  if (!text) return false;
  return badWords.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(text);
  });
};

module.exports = { filterBadWords, hasBadWords };
