import zlib from "zlib";

export function compressObject(obj: {}) {
  const newStr = JSON.stringify(obj);
  const compressed = zlib.gzipSync(newStr, { level: zlib.constants.Z_BEST_COMPRESSION });
  return compressed.toString("base64");
}

export function decompressToObject(str: string) {
  const compressed = Buffer.from(str, "base64");
  const decompressed = zlib.unzipSync(compressed).toString();
  console.log(decompressed);
  return JSON.parse(decompressed);
}
