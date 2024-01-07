import { GameState, QMPlayer } from "../lib/qmplayer";
import { parse } from "../lib/qmreader";
import fs from "fs";

export class QMStepGame {
  private readonly QMPlayer: QMPlayer;
  private readonly game: Buffer;

  constructor(gameName: string) {
    this.game = fs.readFileSync(__dirname + "/../../borrowed/qm/start/" + gameName + ".qmm");
    const qm = parse(this.game);
    this.QMPlayer = new QMPlayer(qm, "rus");
  }

  startGame() {
    this.QMPlayer.start();
    console.info(JSON.stringify(this.QMPlayer.getSaving));
    return this.QMPlayer.getSaving();
  }

  nextStage(prevState: GameState, jumpId: number) {
    this.QMPlayer.loadSaving(prevState);
    this.QMPlayer.performJump(jumpId);
    return this.QMPlayer.getSaving();
  }

  showStage(state: GameState) {
    this.QMPlayer.loadSaving(state);
    return this.QMPlayer.getState();
  }
}
