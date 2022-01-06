import * as fs from "fs";
import * as assert from "assert";
import "mocha";
import { Writer } from "../lib/qmwriter";
import { Reader } from "../lib/qmreader";

describe("Writer class", () => {
  for (const chunkSize of [1, 3, 100]) {
    describe(`Chunk size = ${chunkSize}`, () => {
      it(`Empty buff`, () => {
        const w = new Writer();
        assert.strictEqual(w.export().length, 0);
      });
      it(`int32`, () => {
        const w = new Writer();
        w.int32(83758303);
        const buf = w.export();
        assert.strictEqual(w.export().length, 4);

        const r = new Reader(buf);
        assert.strictEqual(r.int32(), 83758303);
      });
      it(`Empty string`, () => {
        const w = new Writer();
        w.writeString(null);
        const buf = w.export();
        assert.strictEqual(w.export().length, 4);

        const r = new Reader(buf);
        assert.strictEqual(r.readString(), ""); // ReadString returns "" if string is empty
      });

      it(`Not empty string with utf8 symbols`, () => {
        const w = new Writer();
        w.writeString("Лол куку");
        const buf = w.export();
        assert.strictEqual(w.export().length, 4 + 4 + 8 * 2);

        const r = new Reader(buf);
        assert.strictEqual(r.readString(), "Лол куку"); // ReadString returns "" if string is empty
      });
    });
  }
});