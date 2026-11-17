/**
 * Regenerates the site's icons, share image and logo tile in the current
 * palette (DESIGN.md, "Oat, forest, tomato").
 *
 *   node scripts/make-brand-images.mjs
 *
 * Why a script: these files are raster copies of the colour tokens. When the
 * palette changes they have to be remade, and doing it by hand is how the
 * previous set stayed blue after the site went green.
 *
 * The AM Group logo is white artwork, so every image here puts it on the
 * forest green (the 30%). The share image adds an oat strip (the 60) with a
 * tomato rule (the 10).
 */
import sharp from 'sharp'
import { writeFileSync } from 'node:fs'

const GREEN = '#24523d'
const GREEN_DEEP = '#1b4130'
const OAT = '#f3ecdf'
const INK = '#14241c'
const TOMATO = '#d63a20'

const LOGO = 'public/logo-am-group.png' // white artwork on transparent, 169x112

async function logoAt(width) {
  return sharp(LOGO).resize({ width, kernel: 'lanczos3' }).png().toBuffer()
}

/** A square tile: the logo centred on forest green. */
async function tile(size, logoShare = 0.62) {
  const w = Math.round(size * logoShare)
  const logo = await logoAt(w)
  const meta = await sharp(logo).metadata()
  return sharp({ create: { width: size, height: size, channels: 4, background: GREEN } })
    .composite([{ input: logo, left: Math.round((size - w) / 2), top: Math.round((size - meta.height) / 2) }])
    .png()
}

const out = []
for (const [file, size] of [
  ['public/icon-192.png', 192],
  ['public/icon-512.png', 512],
  ['public/icon.png', 192],
  ['public/logo-am-group-square.png', 512],
  ['app/icon.png', 192],
  ['app/apple-icon.png', 180],
]) {
  await (await tile(size)).toFile(file)
  out.push(file)
}

// favicon.ico with 32px and 48px PNG entries, written by hand: an ICO file is
// a small header plus the PNGs, and no extra package is needed for that.
const pngs = await Promise.all([32, 48].map(async (s) => (await tile(s, 0.8)).toBuffer()))
const header = Buffer.alloc(6 + 16 * pngs.length)
header.writeUInt16LE(0, 0)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(pngs.length, 4)
let offset = header.length
pngs.forEach((png, i) => {
  const size = [32, 48][i]
  const e = 6 + 16 * i
  header.writeUInt8(size, e)
  header.writeUInt8(size, e + 1)
  header.writeUInt8(0, e + 2)
  header.writeUInt8(0, e + 3)
  header.writeUInt16LE(1, e + 4)
  header.writeUInt16LE(32, e + 6)
  header.writeUInt32LE(png.length, e + 8)
  header.writeUInt32LE(offset, e + 12)
  offset += png.length
})
writeFileSync('app/favicon.ico', Buffer.concat([header, ...pngs]))
out.push('app/favicon.ico')

// Share image, 1200x630: green panel with the logo and the line, oat strip
// with the name and what we do, and a short tomato rule.
const W = 1200
const H = 630
const STRIP = 130
const logo = await logoAt(330)
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H - STRIP}" fill="${GREEN}"/>
  <rect y="${H - STRIP}" width="${W}" height="${STRIP}" fill="${OAT}"/>
  <rect x="80" y="${H - STRIP}" width="${W}" height="2" fill="${GREEN_DEEP}" opacity="0.15"/>
  <text x="80" y="398" font-family="Arial, Helvetica, sans-serif" font-size="74" font-weight="700" fill="#ffffff">Used cars in Jammu</text>
  <rect x="82" y="418" width="200" height="8" rx="4" fill="${TOMATO}"/>
  <text x="80" y="${H - STRIP / 2 + 11}" font-family="Arial, Helvetica, sans-serif" font-size="32" fill="${INK}">AM Group Used Cars · Buy, sell or exchange · usedcarsjammu.com</text>
</svg>`
await sharp(Buffer.from(svg))
  .composite([{ input: logo, left: 80, top: 70 }])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile('public/og-default.jpg')
out.push('public/og-default.jpg')

console.log('wrote', out.join(', '))
