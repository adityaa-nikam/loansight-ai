import { AVAILABLE_BANKS } from '../../constants/banks';

/**
 * Brand-coloured lending-partner tile. One component so every bank reads the
 * same everywhere — officer queue, applicant dashboard, apply flow — instead of
 * six hand-rolled navy squares.
 *
 * Accepts either a bank object from AVAILABLE_BANKS or just the stored bank
 * name/id, so it also works on records that only carry `bankName`.
 */

/** Colours for partners we don't have on file, picked deterministically. */
const FALLBACK_BRANDS = [
  { from: '#163A5F', to: '#0A192F' },
  { from: '#0F766E', to: '#115E59' },
  { from: '#6D28D9', to: '#4C1D95' },
  { from: '#B45309', to: '#7C2D12' },
];

const SIZES = {
  xs: { box: 'w-7 h-7 rounded-md', font: 8 },
  sm: { box: 'w-8 h-8 rounded-lg', font: 9 },
  md: { box: 'w-9 h-9 rounded-lg', font: 10 },
  lg: { box: 'w-10 h-10 rounded-lg', font: 11 },
  xl: { box: 'w-12 h-12 rounded-xl', font: 12 },
};

function hashOf(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) hash = (hash * 31 + text.charCodeAt(i)) % 9973;
  return hash;
}

/** Turns "Bank of Baroda" into "BOB", "Yes Bank" into "YES". */
function labelFrom(name) {
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '—';
  const skip = new Set(['of', 'the', 'and', 'bank', 'ltd', 'limited']);
  const meaningful = words.filter((w) => !skip.has(w.toLowerCase()));
  const source = meaningful.length > 0 ? meaningful : words;
  if (source.length === 1) return source[0].slice(0, 4).toUpperCase();
  return source
    .map((w) => w[0])
    .join('')
    .slice(0, 5)
    .toUpperCase();
}

/** Resolves the tile label + gradient for a bank object, id or name. */
export function bankBrand(bank, name) {
  const record =
    bank && typeof bank === 'object'
      ? bank
      : AVAILABLE_BANKS.find((b) => b.id === bank || b.name === bank) ||
        (name
          ? AVAILABLE_BANKS.find(
              (b) =>
                b.id === name ||
                b.name.toLowerCase() === String(name).toLowerCase() ||
                b.shortName.toLowerCase() === String(name).toLowerCase()
            )
          : null);

  if (record?.brand) {
    return { label: record.shortName, title: record.name, ...record.brand };
  }

  const display = record?.name || name || '';
  if (!display) return { label: '—', title: 'Partner bank', from: '#94A3B8', to: '#64748B' };

  const fallback = FALLBACK_BRANDS[hashOf(display.toLowerCase()) % FALLBACK_BRANDS.length];
  return { label: labelFrom(display), title: display, ...fallback };
}

export default function BankLogo({ bank, name, size = 'md', className = '', labelled = false }) {
  const brand = bankBrand(bank, name);
  const dims = SIZES[size] || SIZES.md;
  // Long marks like ICICI/KOTAK need a step down to stay inside the tile.
  const font = brand.label.length >= 5 ? dims.font - 2 : brand.label.length === 4 ? dims.font - 1 : dims.font;

  return (
    <span
      className={`${dims.box} grid place-items-center shrink-0 font-bold text-white tracking-tight shadow-[0_1px_2px_0_rgba(15,23,42,0.20)] ${className}`}
      style={{
        backgroundImage: `linear-gradient(135deg, ${brand.from} 0%, ${brand.to} 100%)`,
        fontSize: `${font}px`,
      }}
      title={brand.title}
      role={labelled ? 'img' : undefined}
      aria-label={labelled ? brand.title : undefined}
      aria-hidden={labelled ? undefined : 'true'}
    >
      {brand.label}
    </span>
  );
}
