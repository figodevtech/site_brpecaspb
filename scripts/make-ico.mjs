import fs from "fs";
import path from "path";

function createIco(images) {
  const headerSize = 6;
  const dirEntrySize = 16;
  const numImages = images.length;

  let currentOffset = headerSize + numImages * dirEntrySize;
  const dirEntries = [];

  for (const img of images) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // colors
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8); // image size
    entry.writeUInt32LE(currentOffset, 12); // image offset

    dirEntries.push(entry);
    currentOffset += img.buffer.length;
  }

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(numImages, 4); // count

  const buffers = [header, ...dirEntries, ...images.map((img) => img.buffer)];
  return Buffer.concat(buffers);
}

const p16 = fs.readFileSync("public/brand/favicon-16x16.png");
const p32 = fs.readFileSync("public/brand/favicon-32x32.png");
const p48 = fs.readFileSync("public/brand/favicon-48x48.png");

const icoBuffer = createIco([
  { width: 16, height: 16, buffer: p16 },
  { width: 32, height: 32, buffer: p32 },
  { width: 48, height: 48, buffer: p48 },
]);

fs.writeFileSync("public/favicon.ico", icoBuffer);
fs.writeFileSync("app/favicon.ico", icoBuffer);

console.log("favicon.ico gerado com sucesso em public/ e app/!");
