// Turns an article PDF (for example a Google Doc saved as PDF) into article blocks.
// Used by colorteam.io/publish in the browser; written as plain JS so it can also be tested in Node.
//
// How it reads the PDF:
// - Text is grouped into lines, then into paragraphs by the vertical gap between lines.
// - The most common text size is the body size. The largest text on page 1 is the title.
//   Larger text becomes a heading (h2); bold body-size lines that read like a label become a subheading (h3).
// - A bold paragraph that reads like a sentence becomes a pull quote.
// - Lines starting with a bullet or number become lists.
// - The position of every picture in the PDF is recorded, so uploaded images can be placed where they sat in the document.

const BULLET = /^\s*(?:[•●▪◦‣∙·–-]|\d{1,2}[.)])\s+/;

function mul(m, n) {
  return [
    m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5],
  ];
}

function isBoldFont(page, fontName, styles) {
  let name = "";
  try { const f = page.commonObjs.get(fontName); name = (f && (f.name || f.loadedName)) || ""; if (f && f.bold) return true; } catch (e) { /* font not loaded */ }
  name += " " + ((styles && styles[fontName] && styles[fontName].fontFamily) || "");
  return /bold|black|heavy|semibold|demi|extrabold/i.test(name);
}

function joinItems(items) {
  let out = "";
  let prev = null;
  for (const it of items) {
    const s = it.str;
    if (!s) continue;
    if (prev) {
      const gap = it.x - (prev.x + prev.w);
      const needSpace = gap > it.size * 0.15 && !/\s$/.test(out) && !/^\s/.test(s);
      if (needSpace) out += " ";
    }
    out += s;
    prev = it;
  }
  return out.replace(/\s+/g, " ").trim();
}

/**
 * @param {object} pdfjsLib  the pdf.js module (needs getDocument and OPS)
 * @param {Uint8Array|ArrayBuffer} data  the PDF bytes
 * @returns {Promise<{title: string, blocks: Array, imageSlots: number[], pages: number}>}
 *   blocks: [{type: 'lead'|'p'|'h2'|'h3'|'quote'|'ul'|'ol', text?, items?}]
 *   imageSlots: for each picture in the PDF (in order), the number of text blocks that come before it
 */
export async function parseArticlePdf(pdfjsLib, data) {
  const doc = await pdfjsLib.getDocument({ data, isEvalSupported: false }).promise;
  const OPS = pdfjsLib.OPS;
  const lines = []; // {page, y, size, bold, text, x}
  const pics = []; // {page, y}
  let firstPageMax = 0;

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const ops = await page.getOperatorList(); // also loads fonts, so bold can be read
    const tc = await page.getTextContent();
    const vp = page.getViewport({ scale: 1 });

    // Pictures: follow the transform stack to find where each image is drawn.
    let ctm = [1, 0, 0, 1, 0, 0];
    const stack = [];
    for (let i = 0; i < ops.fnArray.length; i++) {
      const fn = ops.fnArray[i];
      if (fn === OPS.save) stack.push(ctm.slice());
      else if (fn === OPS.restore) ctm = stack.pop() || [1, 0, 0, 1, 0, 0];
      else if (fn === OPS.transform) ctm = mul(ctm, ops.argsArray[i]);
      else if (fn === OPS.paintImageXObject || fn === OPS.paintInlineImageXObject || fn === OPS.paintImageXObjectRepeat) {
        const w = Math.hypot(ctm[0], ctm[1]);
        const h = Math.hypot(ctm[2], ctm[3]);
        if (w * h > vp.width * vp.height * 0.02) { // skip tiny icons and rules
          pics.push({ page: p, y: ctm[5] + h, x: ctm[4] }); // top edge
        }
      }
    }

    // Text: group items into lines by baseline.
    const items = tc.items
      .filter((it) => typeof it.str === "string")
      .map((it) => ({
        str: it.str,
        x: it.transform[4],
        y: it.transform[5],
        w: it.width,
        size: Math.round(Math.hypot(it.transform[2], it.transform[3]) * 10) / 10,
        bold: isBoldFont(page, it.fontName, tc.styles),
      }))
      .filter((it) => it.str.trim() || it.str === " ");
    items.sort((a, b) => b.y - a.y || a.x - b.x);
    let cur = null;
    for (const it of items) {
      if (cur && Math.abs(cur.y - it.y) <= Math.max(2, it.size * 0.3)) {
        cur.items.push(it);
      } else {
        if (cur) lines.push(cur);
        cur = { page: p, y: it.y, items: [it] };
      }
    }
    if (cur) lines.push(cur);
  }

  // Finish lines: text, size, bold.
  const done = [];
  for (const l of lines) {
    l.items.sort((a, b) => a.x - b.x);
    const text = joinItems(l.items);
    if (!text) continue;
    if (/^\d{1,3}$/.test(text)) continue; // page numbers
    const real = l.items.filter((i) => i.str.trim());
    const chars = real.reduce((n, i) => n + i.str.length, 0) || 1;
    const size = real.reduce((n, i) => n + i.size * i.str.length, 0) / chars;
    const boldChars = real.filter((i) => i.bold).reduce((n, i) => n + i.str.length, 0);
    done.push({ page: l.page, y: l.y, x: l.items[0].x, size: Math.round(size * 10) / 10, bold: boldChars / chars > 0.6, text });
    if (l.page === 1) firstPageMax = Math.max(firstPageMax, size);
  }

  // Body size: the size with the most characters.
  const tally = {};
  for (const l of done) tally[l.size] = (tally[l.size] || 0) + l.text.length;
  const body = Number(Object.keys(tally).sort((a, b) => tally[b] - tally[a])[0] || 11);

  // Group lines into paragraphs.
  const paras = [];
  let para = null;
  for (const l of done) {
    const big = l.size > body * 1.12;
    const sameStyle = para && Math.abs(para.size - l.size) < 0.6 && para.bold === l.bold;
    const gap = para && para.page === l.page ? para.lastY - l.y : Infinity;
    const continues = para && sameStyle && gap < l.size * 1.75 && !BULLET.test(l.text);
    if (continues) {
      para.text += (/-$/.test(para.text) ? "" : " ") + l.text;
      para.lastY = l.y;
      para.lines++;
    } else {
      if (para) paras.push(para);
      para = { page: l.page, y: l.y, lastY: l.y, size: l.size, bold: l.bold, big, text: l.text, lines: 1, bullet: BULLET.test(l.text) };
    }
  }
  if (para) paras.push(para);

  // Title: the largest paragraph on page 1.
  let title = "";
  let titleIdx = -1;
  paras.forEach((pa, i) => { if (pa.page === 1 && Math.abs(pa.size - firstPageMax) < 0.6 && titleIdx < 0) { titleIdx = i; title = pa.text; } });

  // Heading levels from distinct larger sizes (excluding the title).
  const headSizes = [...new Set(paras.filter((pa, i) => i !== titleIdx && pa.size > body * 1.12).map((pa) => pa.size))].sort((a, b) => b - a);

  const blocks = [];
  const anchors = []; // {page, y, blockIndex} for placing pictures
  let seenBody = false;
  paras.forEach((pa, i) => {
    if (i === titleIdx) { anchors.push({ page: pa.page, y: pa.y, idx: 0 }); return; }
    let block;
    if (pa.size > body * 1.12) {
      const rank = headSizes.indexOf(pa.size);
      block = { type: rank <= 0 || headSizes.length === 1 ? "h2" : "h3", text: pa.text };
    } else if (pa.bullet) {
      const ordered = /^\s*\d/.test(pa.text);
      const item = pa.text.replace(BULLET, "");
      const last = blocks[blocks.length - 1];
      if (last && last.type === (ordered ? "ol" : "ul")) { last.items.push(item); return; }
      block = { type: ordered ? "ol" : "ul", items: [item] };
    } else if (pa.bold) {
      const sentence = /[.!?"”]$/.test(pa.text) && pa.text.length > 60;
      block = sentence ? { type: "quote", text: pa.text } : { type: "h3", text: pa.text };
    } else {
      block = { type: seenBody ? "p" : "lead", text: pa.text };
      seenBody = true;
    }
    blocks.push(block);
    anchors.push({ page: pa.page, y: pa.y, idx: blocks.length });
  });

  // For each picture: how many blocks come before it in reading order.
  let imageSlots = pics.map((pic) => {
    let before = 0;
    for (const a of anchors) {
      if (a.page < pic.page || (a.page === pic.page && a.y > pic.y)) before = a.idx;
    }
    return before;
  });

  // A short bold line straight under the title (a kicker such as "A brand identity project by ...")
  // is returned separately so it can be offered as the subtitle.
  let kicker = "";
  if (blocks[0] && blocks[0].type === "h3" && blocks[0].text.length < 90) {
    kicker = blocks.shift().text;
    imageSlots = imageSlots.map((n) => Math.max(0, n - 1));
  }

  return { title, kicker, blocks, imageSlots, pages: doc.numPages };
}

export function slugify(s) {
  return s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80).replace(/-+$/, "");
}

export function readTime(blocks) {
  const words = blocks.reduce((n, b) => n + ((b.text || "") + " " + (b.items || []).join(" ")).split(/\s+/).filter(Boolean).length, 0);
  return `${Math.max(1, Math.round(words / 200))} min read`;
}
