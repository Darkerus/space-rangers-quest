import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

import { parse } from "./lib/qmreader";

import * as fs from "fs";
import * as assert from "assert";

import { QMPlayer } from "./lib/qmplayer";
const data = fs.readFileSync(__dirname + "/../borrowed/qm/start/grogstorypart_116_beta.qmm");
//const data = fs.readFileSync('../Bank.qm');

const qm = parse(data);
const player = new QMPlayer(qm, "rus"); // true
player.start();

function showAndAsk() {
  const state = player.getState();
  console.info(state);
  rl.question("> ", (answer) => {
    const id = parseInt(answer);
    if (!isNaN(id) && state.choices.find((x) => x.jumpId === id)) {
      player.performJump(id);
    } else {
      console.info(`Wrong input!`);
    }
    showAndAsk();
  });
}

showAndAsk();
