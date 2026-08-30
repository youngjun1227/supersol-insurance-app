/* apple-touch-icon 생성 (#107).

   iOS 는 홈 화면 아이콘으로 180×180 을 기대하고, apple-touch-icon 의 알파를
   **검정으로 합성**한다 — 투명 PNG(app-icon.png)를 그대로 주면 홈 화면에
   검은 사각형이 뜬다. 흰 배경에 합성한 불투명 180×180 을 따로 만든다.

   의존성 없이 zlib 만 쓴다 (라이브러리 최소 원칙).
     node scripts/make-apple-icon.mjs
*/

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync, inflateSync } from 'node:zlib'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = resolve(ROOT, 'public/assets/logo/app-icon.png')
const OUT = resolve(ROOT, 'public/assets/logo/apple-touch-icon.png')
const SIZE = 180

/** PNG 에서 폭·높이·IDAT 을 꺼낸다 (8bit RGBA 만 다룬다) */
function readPng(path) {
  const d = readFileSync(path)
  const width = d.readUInt32BE(16)
  const height = d.readUInt32BE(20)
  const bitDepth = d[24]
  const colorType = d[25]
  if (bitDepth !== 8 || colorType !== 6) {
    throw new Error(`8bit RGBA 가 아닙니다 (bitDepth=${bitDepth} colorType=${colorType})`)
  }
  let pos = 8
  const idat = []
  while (pos < d.length) {
    const len = d.readUInt32BE(pos)
    const type = d.subarray(pos + 4, pos + 8).toString('ascii')
    if (type === 'IDAT') idat.push(d.subarray(pos + 8, pos + 8 + len))
    pos += 12 + len
  }
  return { width, height, raw: inflateSync(Buffer.concat(idat)) }
}

/** PNG 행 필터를 풀어 순수 RGBA 바이트로 */
function unfilter(width, height, raw) {
  const bpp = 4
  const stride = width * bpp
  const out = Buffer.alloc(height * stride)
  let prev = Buffer.alloc(stride)
  let p = 0
  for (let y = 0; y < height; y += 1) {
    const filter = raw[p]
    p += 1
    const line = Buffer.from(raw.subarray(p, p + stride))
    p += stride
    for (let i = 0; i < stride; i += 1) {
      const a = i >= bpp ? line[i - bpp] : 0
      const b = prev[i]
      const c = i >= bpp ? prev[i - bpp] : 0
      if (filter === 1) line[i] = (line[i] + a) & 255
      else if (filter === 2) line[i] = (line[i] + b) & 255
      else if (filter === 3) line[i] = (line[i] + ((a + b) >> 1)) & 255
      else if (filter === 4) {
        const pp = a + b - c
        const pa = Math.abs(pp - a)
        const pb = Math.abs(pp - b)
        const pc = Math.abs(pp - c)
        const pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : c
        line[i] = (line[i] + pr) & 255
      }
    }
    line.copy(out, y * stride)
    prev = line
  }
  return out
}

/** 최근접 이웃 축소 — 아이콘은 원본이 충분히 커서 이 정도로 족하다 */
function resizeToRgbOnWhite(px, srcW, srcH, size) {
  const rgb = Buffer.alloc(size * size * 3)
  for (let y = 0; y < size; y += 1) {
    const sy = Math.floor((y * srcH) / size)
    for (let x = 0; x < size; x += 1) {
      const sx = Math.floor((x * srcW) / size)
      const s = (sy * srcW + sx) * 4
      const alpha = px[s + 3] / 255
      const d = (y * size + x) * 3
      // 흰 배경에 합성 — 알파를 남기면 iOS 가 검정으로 채운다
      rgb[d] = Math.round(px[s] * alpha + 255 * (1 - alpha))
      rgb[d + 1] = Math.round(px[s + 1] * alpha + 255 * (1 - alpha))
      rgb[d + 2] = Math.round(px[s + 2] * alpha + 255 * (1 - alpha))
    }
  }
  return rgb
}

const CRC_TABLE = (() => {
  const t = new Int32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()

function crc32(buf) {
  let c = -1
  for (let i = 0; i < buf.length; i += 1) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ -1) >>> 0
}

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function writeRgbPng(path, size, rgb) {
  const stride = size * 3
  const rows = []
  for (let y = 0; y < size; y += 1) {
    rows.push(Buffer.from([0]), rgb.subarray(y * stride, (y + 1) * stride))
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // color type: truecolor (알파 없음)
  writeFileSync(path, Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(Buffer.concat(rows), { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]))
}

const { width, height, raw } = readPng(SRC)
const px = unfilter(width, height, raw)
writeRgbPng(OUT, SIZE, resizeToRgbOnWhite(px, width, height, SIZE))
console.log(`✓ apple-touch-icon.png ${SIZE}×${SIZE} (불투명)`)
