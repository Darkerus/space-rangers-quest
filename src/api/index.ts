import zlib from "zlib";

function compressObject(str: string) {
  const newStr = JSON.stringify(JSON.parse(str));
  console.log(newStr);
  console.log();

  const compressed = zlib.gzipSync(newStr, { level: zlib.constants.Z_BEST_COMPRESSION });
  return compressed.toString("base64");
}

function decompressToObject(str: string) {
  const compressed = Buffer.from(str, "base64");
  const decompressed = zlib.unzipSync(compressed).toString();
  return JSON.parse(decompressed);
}
