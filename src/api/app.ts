import express, { Express } from "express";
import { QMStepGame } from "./QMStepGame";
import { compressObject, decompressToObject } from "./compressor";
import { prepareRouter } from "./router";

export class App {
  private readonly qmStepGame: QMStepGame;
  private readonly app: Express;

  constructor(gameName: string = "grogstorypart_116_beta") {
    this.qmStepGame = new QMStepGame(gameName);
    this.app = express();
    this.initApp();
    this.initRoutes();
  }

  private initApp() {
    this.app.use(express.json());
    this.app.use((req, res, next) => {
      const json = req.body;
      if (req.method === "post" && json.state === undefined) {
        res.send("No state in request").status(401);
        return;
      }
      next();
    });
  }

  private initRoutes() {
    this.app.use(prepareRouter(this.qmStepGame));
  }

  public listen(port: number, host: string, callback?: () => void) {
    return this.app.listen(port, host, callback);
  }
}

export default App;
