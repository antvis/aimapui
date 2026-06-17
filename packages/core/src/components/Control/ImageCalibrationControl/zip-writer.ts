/**
 * 轻量级浏览器端 ZIP 打包（STORE 模式，不压缩）
 * 无任何外部依赖，足够用于打包少量图片切片 + JSON 文件
 */

interface ZipEntry {
  name: string;
  data: Uint8Array;
}

export class ZipWriter {
  private entries: ZipEntry[] = [];

  addFile(name: string, data: Uint8Array | Blob | string): void {
    if (typeof data === 'string') {
      this.entries.push({ name, data: new TextEncoder().encode(data) });
    } else if (data instanceof Blob) {
      // Blob 需异步处理，先存占位
      this.entries.push({ name, data: new Uint8Array(0) });
    } else {
      this.entries.push({ name, data });
    }
  }

  async addBlob(name: string, blob: Blob): Promise<void> {
    const buf = await blob.arrayBuffer();
    this.entries.push({ name, data: new Uint8Array(buf) });
  }

  generate(): Blob {
    const localHeaders: Uint8Array[] = [];
    const centralHeaders: Uint8Array[] = [];
    let offset = 0;

    for (const entry of this.entries) {
      const nameBytes = new TextEncoder().encode(entry.name);
      const crc = crc32(entry.data);
      const size = entry.data.length;

      // Local file header (30 + name)
      const local = new Uint8Array(30 + nameBytes.length);
      const lv = new DataView(local.buffer);
      lv.setUint32(0, 0x04034b50, true); // signature
      lv.setUint16(4, 20, true);         // version needed
      lv.setUint16(6, 0, true);          // flags
      lv.setUint16(8, 0, true);          // compression: STORE
      lv.setUint16(10, 0, true);         // mod time
      lv.setUint16(12, 0, true);         // mod date
      lv.setUint32(14, crc, true);       // crc32
      lv.setUint32(18, size, true);      // compressed size
      lv.setUint32(22, size, true);      // uncompressed size
      lv.setUint16(26, nameBytes.length, true);
      lv.setUint16(28, 0, true);         // extra field length
      local.set(nameBytes, 30);

      localHeaders.push(local);
      localHeaders.push(entry.data);

      // Central directory header (46 + name)
      const central = new Uint8Array(46 + nameBytes.length);
      const cv = new DataView(central.buffer);
      cv.setUint32(0, 0x02014b50, true); // signature
      cv.setUint16(4, 20, true);         // version made by
      cv.setUint16(6, 20, true);         // version needed
      cv.setUint16(8, 0, true);          // flags
      cv.setUint16(10, 0, true);         // compression
      cv.setUint16(12, 0, true);         // mod time
      cv.setUint16(14, 0, true);         // mod date
      cv.setUint32(16, crc, true);       // crc32
      cv.setUint32(20, size, true);      // compressed size
      cv.setUint32(24, size, true);      // uncompressed size
      cv.setUint16(28, nameBytes.length, true);
      cv.setUint16(30, 0, true);         // extra field length
      cv.setUint16(32, 0, true);         // comment length
      cv.setUint16(34, 0, true);         // disk number start
      cv.setUint16(36, 0, true);         // internal attributes
      cv.setUint32(38, 0, true);         // external attributes
      cv.setUint32(42, offset, true);    // local header offset
      central.set(nameBytes, 46);

      centralHeaders.push(central);
      offset += local.length + entry.data.length;
    }

    // End of central directory
    const centralSize = centralHeaders.reduce((s, c) => s + c.length, 0);
    const eocd = new Uint8Array(22);
    const ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true);                 // signature
    ev.setUint16(4, 0, true);                          // disk number
    ev.setUint16(6, 0, true);                          // central dir disk
    ev.setUint16(8, this.entries.length, true);        // entries on disk
    ev.setUint16(10, this.entries.length, true);       // total entries
    ev.setUint32(12, centralSize, true);               // central dir size
    ev.setUint32(16, offset, true);                    // central dir offset
    ev.setUint16(20, 0, true);                         // comment length

    return new Blob([...localHeaders, ...centralHeaders, eocd] as BlobPart[], { type: 'application/zip' });
  }
}

// CRC32 lookup table
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  CRC_TABLE[i] = c;
}

function crc32(data: Uint8Array): number {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = CRC_TABLE[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
