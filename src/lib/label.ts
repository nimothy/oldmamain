/**
 * The Old Ma Main's jar label, drawn as one 512 × 720 SVG.
 *
 * The same function renders labels at build time (Label.astro) and in the
 * browser (label maker preview, PNG download, print sheet), so every label
 * keeps the same frame, type and ribbon.
 */

export const PAPER = '#fcf4d8';
export const INK = '#3d1e03';

export const CASLON = "'Libre Caslon Text', 'Big Caslon', Georgia, serif";
export const FELL = "'IM Fell English SC', 'Libre Caslon Text', Georgia, serif";

export const LABEL_WIDTH = 512;
export const LABEL_HEIGHT = 720;

/**
 * Every product name is set at one size: the size SEVILLE ORANGE / MARMALADE
 * needs to fit (the design system's `product-long`, 40px on a 512px label).
 */
export const PRODUCT_SIZE = 40;
/** Longest product line, in characters, that fits at PRODUCT_SIZE: SEVILLE ORANGE. */
export const PRODUCT_MAX_CHARS = 14;

/** The engraved baskets from the design system, one per fruit or flower. */
export const BASKETS = [
  { id: 'oranges', name: 'Seville oranges' },
  { id: 'quinces', name: 'Quinces' },
  { id: 'strawberries', name: 'Strawberries' },
  { id: 'elderflowers', name: 'Elderflowers' },
  { id: 'crab-apples', name: 'Crab apples' },
] as const;

export type BasketId = (typeof BASKETS)[number]['id'];

export function isBasketId(id: string | undefined | null): id is BasketId {
  return BASKETS.some((b) => b.id === id);
}

/** Public URL of a basket engraving. */
export function basketUrl(id: BasketId): string {
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/baskets/${id}.svg`;
}

/** Basket artwork is 526 × 416; it sits between the laurels, above the product name. */
const BASKET_BOX = { x: 154, y: 150, w: 204, h: Math.round((204 * 416) / 526) };

export interface LabelText {
  line1: string;
  line2?: string;
  /** Month and year made, e.g. "AUGUST 2026". */
  batch: string;
  /** Short phrase unique to the product; MADE WITH LOVE is appended. */
  phrase?: string;
  /** Which engraved basket to show. Omit for the plain placeholder. */
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
  /** Extra markup placed inside <defs>, e.g. embedded @font-face rules for PNG export. */
  extraDefs?: string;
  /** Explicit pixel size; omit to let the SVG fill its container. */
  width?: number;
  height?: number;
  /** Accessible mode: role="img" with an aria-label. Off for decorative copies. */
  accessible?: boolean;
  /** Override the basket image URL, e.g. a data: URI so exports are self-contained. */
  basketHref?: string;
}

/** Vertical offset from a line's centre to its baseline, for all-capitals text. */
const capsBaseline = (size: number) => size * 0.34;

export function renderLabelSvg(text: LabelText, opts: LabelSvgOptions = {}): string {
  const id = opts.idPrefix ?? 'oldma';
  const lines = productLines(text);
  const prodPx = PRODUCT_SIZE;
  const lineHeight = prodPx * 1.08;

  const batch = clean(text.batch);
  const batchPx = Math.min(36, 300 / (Math.max(batch.length, 1) * 0.7));

  const tag = tagline(text.phrase);
  const tagPx = Math.min(18, 369 / (tag.length * 0.72));

  // Product name block is centred in the band between the illustration and the ribbon.
  const productCentre = 410;
  const firstCentre = productCentre - ((lines.length - 1) * lineHeight) / 2;
  const productText = lines
    .map((line, i) => {
      const y = firstCentre + i * lineHeight + capsBaseline(prodPx);
      return `<text x="256" y="${y.toFixed(1)}" text-anchor="middle" font-family="${CASLON}" font-weight="700" font-size="${prodPx.toFixed(1)}" fill="${INK}">${escapeXml(line)}</text>`;
    })
    .join('');

  const basketHref = opts.basketHref ?? (text.basket ? basketUrl(text.basket) : undefined);
  const illustration = basketHref
    ? `<image href="${escapeXml(basketHref)}" x="${BASKET_BOX.x}" y="${BASKET_BOX.y}" width="${BASKET_BOX.w}" height="${BASKET_BOX.h}" preserveAspectRatio="xMidYMid meet"/>`
    : `<rect x="171" y="150" width="170" height="170" fill="url(#${id}-hatch)" stroke="${INK}" stroke-width="2.5"/>
<rect x="196" y="213" width="120" height="44" fill="${PAPER}" stroke="${INK}" stroke-width="2.5"/>
<text x="256" y="241" text-anchor="middle" font-family="${FELL}" font-size="15" letter-spacing="1.5" fill="${INK}">BASKET</text>`;

  const size =
    opts.width && opts.height ? ` width="${opts.width}" height="${opts.height}"` : ' width="100%" height="100%"';
  const a11y =
    opts.accessible === false
      ? ' aria-hidden="true"'
      : ` role="img" aria-label="${escapeXml(labelAlt(text))}"`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LABEL_WIDTH} ${LABEL_HEIGHT}"${size}${a11y} style="display:block">
<defs>
<pattern id="${id}-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" stroke="${INK}" stroke-width="1"/></pattern>
<path id="${id}-arc" d="M 56 152 Q 256 22 456 152"/>
${opts.extraDefs ?? ''}
</defs>
<rect width="${LABEL_WIDTH}" height="${LABEL_HEIGHT}" fill="${PAPER}"/>
<rect x="16" y="16" width="480" height="688" fill="none" stroke="${INK}" stroke-width="3.5"/>
<rect x="28" y="28" width="456" height="664" fill="none" stroke="${INK}" stroke-width="2.5"/>
<path d="M 40 58 L 40 40 L 58 40" fill="none" stroke="${INK}" stroke-width="2.5"/>
<path d="M 454 40 L 472 40 L 472 58" fill="none" stroke="${INK}" stroke-width="2.5"/>
<path d="M 40 662 L 40 680 L 58 680" fill="none" stroke="${INK}" stroke-width="2.5"/>
<path d="M 454 680 L 472 680 L 472 662" fill="none" stroke="${INK}" stroke-width="2.5"/>
<text font-family="${CASLON}" font-weight="700" font-size="46" letter-spacing="1" fill="${INK}"><textPath href="#${id}-arc" startOffset="50%" text-anchor="middle">OLD MA MAIN'S</textPath></text>
<path d="M 150 175 Q 118 235 150 300" fill="none" stroke="${INK}" stroke-width="2.5"/>
<path d="M 362 175 Q 394 235 362 300" fill="none" stroke="${INK}" stroke-width="2.5"/>
${illustration}
<polygon points="76,495 436,495 418,530 436,565 76,565 94,530" fill="${PAPER}" stroke="${INK}" stroke-width="2.5"/>
${productText}
<text x="256" y="${(530 + capsBaseline(batchPx)).toFixed(1)}" text-anchor="middle" font-family="${CASLON}" font-weight="700" font-size="${batchPx.toFixed(1)}" letter-spacing="${(batchPx * 0.04).toFixed(2)}" fill="${INK}">${escapeXml(batch)}</text>
<text x="256" y="${(620 + capsBaseline(tagPx)).toFixed(1)}" text-anchor="middle" font-family="${FELL}" font-size="${tagPx.toFixed(1)}" letter-spacing="${(tagPx * 0.08).toFixed(2)}" fill="${INK}">${escapeXml(tag)}</text>
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
