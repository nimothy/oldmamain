/**
 * The Old Ma Main's jar label, drawn as one 1024 × 1536 (2:3) SVG.
 *
 * The same function renders labels at build time (Label.astro) and in the
 * browser (label maker preview, PNG and PDF downloads, print sheet), so every
 * label keeps the same frame, flourishes, laurels, type and ribbon.
 * Geometry follows the design's Label component.
 */

export const PAPER = '#fcf4d8';
export const INK = '#3d1e03';

export const CASLON = "'Libre Caslon Text', 'Big Caslon', Georgia, serif";
export const FELL = "'IM Fell English SC', 'Libre Caslon Text', Georgia, serif";

export const LABEL_WIDTH = 1024;
export const LABEL_HEIGHT = 1536;

/**
 * Every product name is set at one size: the size SEVILLE ORANGE / MARMALADE
 * needs to fit within 70% of the label (the design system's `product-long`).
 */
export const PRODUCT_SIZE = 80;
/** Longest product line, in characters, that fits at PRODUCT_SIZE: SEVILLE ORANGE. */
export const PRODUCT_MAX_CHARS = 14;

/** The engraved baskets from the design system, one per fruit or flower. */
export const BASKETS = [
  { id: 'oranges', name: 'Seville oranges', file: 'oranges.svg' },
  { id: 'quinces', name: 'Quinces', file: 'quinces.svg' },
  { id: 'strawberries', name: 'Strawberries', file: 'strawberries.svg' },
  { id: 'elderflowers', name: 'Elderflowers', file: 'elderflowers.svg' },
  { id: 'crab-apples', name: 'Crab apples', file: 'crab-apples.svg' },
  { id: 'vegetables', name: 'Vegetables (any other product)', file: 'vegetables.png' },
] as const;

export type BasketId = (typeof BASKETS)[number]['id'];

/** Used for a new product until it has a basket of its own. */
export const DEFAULT_BASKET: BasketId = 'vegetables';

export function isBasketId(id: string | undefined | null): id is BasketId {
  return BASKETS.some((b) => b.id === id);
}

const asset = (path: string) => `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}`;

/** Public URL of a basket engraving. */
export function basketUrl(id: BasketId): string {
  return asset(`/baskets/${BASKETS.find((b) => b.id === id)!.file}`);
}

/** The label's fixed ornaments: corner flourish (mirrored ×4) and laurel sprig (mirrored ×2). */
export const ORNAMENTS = {
  corner: asset('/label/corner.png'),
  laurel: asset('/label/laurel.png'),
};

export interface LabelText {
  line1: string;
  line2?: string;
  /** Month and year made, e.g. "AUGUST 2026". */
  batch: string;
  /** Short phrase unique to the product; MADE WITH LOVE is appended. */
  phrase?: string;
  /** Which engraved basket to show. */
  basket?: BasketId;
}

const clean = (s: string | undefined | null) => String(s ?? '').trim().toUpperCase();

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function productLines(text: Pick<LabelText, 'line1' | 'line2'>): string[] {
  return [clean(text.line1), clean(text.line2)].filter(Boolean);
}

/** True when a product line is too long to fit inside the frame at the standard size. */
export function isTooLong(text: Pick<LabelText, 'line1' | 'line2'>): boolean {
  return productLines(text).some((l) => l.length > PRODUCT_MAX_CHARS);
}

export function tagline(phrase: string | undefined): string {
  const p = clean(phrase);
  return p ? `${p} • MADE WITH LOVE` : 'MADE WITH LOVE';
}

export function labelAlt(text: LabelText): string {
  return `Label: ${productLines(text).join(' ')}, ${clean(text.batch)}, ${tagline(text.phrase)}`;
}

export interface LabelSvgOptions {
  /** Unique prefix for ids inside the SVG, so several labels can share a page. */
  idPrefix?: string;
  /** Extra markup placed inside <defs>, e.g. embedded @font-face rules for exports. */
  extraDefs?: string;
  /** Explicit pixel size; omit to let the SVG fill its container. */
  width?: number;
  height?: number;
  /** Accessible mode: role="img" with an aria-label. Off for decorative copies. */
  accessible?: boolean;
  /** Override image URLs, e.g. data: URIs so exports are self-contained. */
  hrefs?: { basket?: string; corner?: string; laurel?: string };
}

const round = (n: number) => (Math.round(n * 10) / 10).toString();

export function renderLabelSvg(text: LabelText, opts: LabelSvgOptions = {}): string {
  const id = opts.idPrefix ?? 'oldma';
  const lines = productLines(text);
  const two = lines.length > 1;

  // Product name: one size for every product. Two lines sit so descenders clear the ribbon.
  const size = PRODUCT_SIZE;
  const base2 = 1090 - size * 0.3 - 12;
  const ys = two ? [base2 - size * 1.08, base2] : [1015];
  const productText = lines
    .map(
      (line, i) =>
        `<text x="512" y="${round(ys[i])}" font-size="${size}" text-anchor="middle" font-family="${CASLON}" font-weight="700" fill="${INK}">${escapeXml(line)}</text>`,
    )
    .join('');

  const batch = clean(text.batch);
  const batchSize = Math.max(40, Math.min(72, 600 / (Math.max(batch.length, 1) * 0.72)));
  const tag = tagline(text.phrase);
  const tagSize = Math.max(20, Math.min(38, 740 / (tag.length * 0.72)));

  // Basket and laurels shrink a little on two-line names so the stack keeps its spacing.
  const basketBox = two ? { x: 257, y: 368, w: 510, h: 403 } : { x: 226, y: 372, w: 566, h: 466 };
  const laurelBox = two ? { x: 112, y: 500, w: 113, h: 200 } : { x: 95, y: 530, w: 130, h: 230 };

  const basketHref = opts.hrefs?.basket ?? basketUrl(text.basket ?? DEFAULT_BASKET);
  const corner = escapeXml(opts.hrefs?.corner ?? ORNAMENTS.corner);
  const laurel = escapeXml(opts.hrefs?.laurel ?? ORNAMENTS.laurel);
  // The ornaments are scans on a paper-coloured ground that drifts a shade from PAPER;
  // `darken` lets the label's own paper show through so no lighter boxes appear.
  const img = (href: string, b: { x: number; y: number; w: number; h: number }, transform = '') =>
    `<image href="${href}" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" preserveAspectRatio="xMidYMid meet" style="mix-blend-mode:darken"${transform ? ` transform="${transform}"` : ''}/>`;
  const cornerBox = { x: 40, y: 40, w: 190, h: 190 };

  const dims =
    opts.width && opts.height ? ` width="${opts.width}" height="${opts.height}"` : ' width="100%" height="100%"';
  const a11y =
    opts.accessible === false
      ? ' aria-hidden="true"'
      : ` role="img" aria-label="${escapeXml(labelAlt(text))}"`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LABEL_WIDTH} ${LABEL_HEIGHT}"${dims}${a11y} style="display:block">
<defs>
<path id="${id}-arc" d="M90 460 A640 640 0 0 1 934 460" fill="none"/>
${opts.extraDefs ?? ''}
</defs>
<rect width="${LABEL_WIDTH}" height="${LABEL_HEIGHT}" fill="${PAPER}"/>
<rect x="35" y="53.5" width="954" height="1405" fill="none" stroke="${INK}" stroke-width="7"/>
<rect x="61" y="83" width="902" height="1346" fill="none" stroke="${INK}" stroke-width="5"/>
${img(corner, cornerBox)}
${img(corner, cornerBox, 'translate(1024 0) scale(-1 1)')}
${img(corner, cornerBox, 'translate(0 1512) scale(1 -1)')}
${img(corner, cornerBox, 'translate(1024 1512) scale(-1 -1)')}
<text font-family="${CASLON}" font-weight="700" font-size="86" letter-spacing="3" fill="${INK}"><textPath href="#${id}-arc" startOffset="50%" text-anchor="middle">OLD MA MAIN'S</textPath></text>
${img(laurel, laurelBox)}
${img(laurel, laurelBox, 'translate(1024 0) scale(-1 1)')}
${img(escapeXml(basketHref), basketBox)}
<path d="M140 1090 H884 L850 1142 L884 1194 H140 L174 1142 Z" fill="${PAPER}" stroke="${INK}" stroke-width="5" stroke-linejoin="miter"/>
${productText}
<text x="512" y="1168" font-size="${round(batchSize)}" text-anchor="middle" font-family="${CASLON}" font-weight="700" letter-spacing="3" fill="${INK}">${escapeXml(batch)}</text>
<text x="512" y="1258" font-size="${round(tagSize)}" text-anchor="middle" font-family="${FELL}" letter-spacing="3" fill="${INK}">${escapeXml(tag)}</text>
</svg>`;
}

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/** "2026-08" → "AUGUST 2026"; undefined → fallback. */
export function batchFromMade(made: string | undefined, fallback = 'COMING SOON'): string {
  if (!made) return fallback;
  const [year, month] = made.split('-');
  return `${MONTHS[Number(month) - 1]} ${year}`.toUpperCase();
}

/**
 * A full A4 sheet of labels: 3 columns × 4 rows, used by both the PDF
 * download and the browser's print sheet. Millimetres.
 */
export const SHEET = (() => {
  const page = { w: 210, h: 297 };
  const cols = 3;
  const rows = 4;
  const gap = 4;
  const margin = 10;
  const labelH = (page.h - 2 * margin - (rows - 1) * gap) / rows;
  const labelW = (labelH * LABEL_WIDTH) / LABEL_HEIGHT;
  const left = (page.w - cols * labelW - (cols - 1) * gap) / 2;
  return { page, cols, rows, gap, margin, labelW, labelH, left };
})();
