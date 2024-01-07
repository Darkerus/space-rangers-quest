import express from "express";
import { QMStepGame } from "./QMStepGame";
import { decompressToObject, compressObject } from "./compressor";

const app = express();

const qmGame = new QMStepGame("grogstorypart_116_beta");

app.use(express.json());
app.use((req, res, next) => {
  const json = req.body;
  if (json.state === undefined) {
    res.send("No state in request").status(401);
    return;
  }
  next();
});

app.post("/load", (req, res) => {
  const json = req.body;
  const state = qmGame.showStage(decompressToObject(json.state));
  res.send(state);
});

app.post("/jump", (req, res) => {
  const json = req.body;
  const state = decompressToObject(json.state);
  const stage = qmGame.showStage(state);
  const nextJumpId = json.nextJumpId;

  if (!isNaN(json.nextJumpId) && stage.choices.find((x: any) => x.jumpId === nextJumpId)) {
    const newState = qmGame.nextStage(state, nextJumpId);
    const newStage = qmGame.showStage(newState);

    res.send(
      JSON.stringify({
        state: compressObject(newState),
        stageIngo: newStage,
      }),
    );
    return;
  }

  res.send("No valid JumpId in request").status(401);
});

app.all("/start", (req, res) => {
  const state = qmGame.startGame();
  const stage = qmGame.showStage(state);

  res.send(
    JSON.stringify({
      state: compressObject(state),
      stageIngo: stage,
    }),
  );
});

app.listen(3001, "localhost", () => console.log("I'm Work!"));
