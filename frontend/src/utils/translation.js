/**
 * Clean translation text by removing HTML tags and converting footnote markers.
 * API returns format like: "In the name of Allāh,<sup foot_note=195932>1</sup> the Entirely Merciful"
 */
const SUPERSCRIPT = '⁰¹²³⁴⁵⁶⁷⁸⁹';

export function cleanTranslationText(text) {
  if (!text || typeof text !== 'string') return '';
  let cleaned = text
    // Replace <sup foot_note=XXX>N</sup> with superscript number
    .replace(/<sup[^>]*>(\d+)<\/sup>/gi, (_, num) =>
      num.split('').map((d) => SUPERSCRIPT[parseInt(d, 10)] || d).join('')
    )
    // Remove any remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Decode common HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned;
}

/**
 * Clean tajweed text - strip HTML tags, keep readable Arabic.
 * Handles: "بِسْمِ<tajweed class=ham_wasl>ٱ</tajweed>للَّهِ" or spaced format.
 */
export function cleanTajweedText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/<span\s+class=end>[\d٠-٩]+<\/span>/gi, '') // Remove verse number span
    .replace(/<tajweed[^>]*>([^<]*)<\/tajweed>/gi, '$1') // Extract content from tajweed tags
    .replace(/<[^>]+>/g, '') // Remove any remaining HTML tags
    .replace(/\s*[\d٠-٩]+\s*$/g, '') // Remove trailing verse number
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tajweed rule colors and human-readable labels for the legend.
 * Each rule has: color (hex), label (short), description (full).
 */
export const TAJWEED_RULES = {
  ham_wasl: { color: '#22c55e', label: 'Hamzat ul Wasl', desc: 'Hamza of connection – not pronounced when joining the previous word' },
  laam_shamsiyah: { color: '#3b82f6', label: 'Lam Shamsiyyah', desc: 'Solar lam – the definite article assimilates into the following sun letter' },
  laam_qamariyah: { color: '#0ea5e9', label: 'Lam Qamariyyah', desc: 'Lunar lam – the definite article is pronounced clearly before moon letters' },
  madda_normal: { color: '#eab308', label: 'Normal Madd', desc: 'Natural prolongation – extend 2 vowel counts' },
  madda_permissible: { color: '#f97316', label: 'Permissible Madd', desc: 'Optional prolongation – 2, 4, or 6 vowel counts' },
  madda_necessary: { color: '#dc2626', label: 'Necessary Madd', desc: 'Required prolongation – 6 vowel counts' },
  madda_obligatory: { color: '#7c3aed', label: 'Obligatory Madd', desc: 'Must prolong – 4–5 vowel counts' },
  ghunnah: { color: '#06b6d4', label: 'Ghunnah', desc: 'Nasal sound – hum through the nose with ن or م' },
  idghaam: { color: '#8b5cf6', label: 'Idghaam', desc: 'Merging – one letter blends into the next' },
  qalqalah: { color: '#f59e0b', label: 'Qalqalah', desc: 'Echoing – slight bounce on ق ط ب ج د when followed by sukoon' },
  ikhfa: { color: '#14b8a6', label: 'Ikhfa', desc: 'Hiding – ن is hidden and pronounced with ghunnah before certain letters' },
  iqlab: { color: '#a855f7', label: 'Iqlab', desc: 'Conversion – ن becomes م before ب' },
  izhar: { color: '#10b981', label: 'Izhar', desc: 'Clarity – ن is pronounced clearly before throat letters' },
};

const TAJWEED_COLORS = Object.fromEntries(
  Object.entries(TAJWEED_RULES).map(([k, v]) => [k, v.color])
);

export function renderTajweedHtml(text) {
  if (!text || typeof text !== 'string') return '';
  let html = text
    .replace(/<span\s+class=end>[\d٠-٩]+<\/span>/gi, '') // Remove verse number
    .replace(/<tajweed\s+class=([a-z_]+)>([^<]*)<\/tajweed>/gi, (_, cls, content) => {
      const rule = TAJWEED_RULES[cls];
      const color = rule?.color || TAJWEED_COLORS[cls] || '#64748b';
      const title = (rule?.label || cls.replace(/_/g, ' ')).replace(/"/g, '&quot;');
      return `<span class="tajweed-rule" data-rule="${cls}" style="color:${color}" title="${title}">${content}</span>`;
    })
    .replace(/<[^>]+>/g, '') // Remove any other tags
    .trim();
  return html;
}
