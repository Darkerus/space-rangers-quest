import { NextFunction, Request, Response, Router } from "express";
import { compressObject, decompressToObject } from "./compressor";
import { QMStepGame } from "./QMStepGame";

export function prepareRouter(qmStepGame: QMStepGame) {
  const router = Router();

  router.post("/load", (req, res) => {
    const json = req.body;
    const state = qmStepGame.showStage(decompressToObject(json.state));
    res.send(state);
  });

  router.post("/jump", (req, res) => {
    const json = req.body;
    const state = decompressToObject(json.state);
    const stage = qmStepGame.showStage(state);
    const nextJumpId = json.nextJumpId;

    if (!isNaN(json.nextJumpId) && stage.choices.find((x: any) => x.jumpId === nextJumpId)) {
      const newState = qmStepGame.nextStage(state, nextJumpId);
      const newStage = qmStepGame.showStage(newState);

      res.send(
        JSON.stringify({
          state: compressObject(newState),
          stageInfo: newStage,
        }),
      );
      return;
    }

    res.send("No valid JumpId in request").status(401);
  });

  router.all("/start", (req, res) => {
    const state = qmStepGame.startGame();
    const stage = qmStepGame.showStage(state);

    res.send(
      JSON.stringify({
        state: compressObject(state),
        stageInfo: stage,
      }),
    );
  });

  return router;
}
