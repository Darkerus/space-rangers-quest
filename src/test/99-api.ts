import "mocha";
import http from "http";
import * as assert from "assert";
import QMApp from "../api/app";
import { exit } from "process";

describe("Api Server", () => {
  const app = new QMApp();
  let is = false;
  const server = app.listen(3001, "localhost", function () {
    is = true;
  });

  it("Server listen", function () {
    assert.ok(is, "Server didnt Listen");
  });

  it("API start new Game", function () {
    const options = {
      hostname: "localhost",
      port: 3001,
      path: "/start",
      method: "GET",
    };

    const allData: string[] = [];
    const req = http.request(options, (res) => {
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        allData.push(chunk);
      });
      res.on("end", () => {
        const gameJson = JSON.parse(allData.join());
        assert.equal(
          gameJson.stageInfo.text,
          'Откройте для себя главу из жизни полуорка Грога и его спутника колдуна Реординарта. Раскройте тайну ледяного Шпиля и повлияйте на судьбу героя приключения "Клад Королевы Драконов" в версии канала "Герои Метагейминга"! Хъ!',
        );
      });
    });
    req.end();
  });

  it("API Load game state", function () {
    const postData = JSON.stringify({
      state:
        "H4sIAAAAAAACA71TwW7bMAz9FUNnNRAlS5Z87WHYDkOBbL0URaHFSqbWtjJLXjsE+fdRdtYMnbFhKFAQpkHy6ZGy+Q4kJpscqcn92O0JJW3Y2ORD/74hNUiMbUwfsJRjzinZDD5d2cF2OdGPbUvJPsTov7QuwyKpbw7EbpL/jqRpGB0lHpFCHOlivlzOc368Rebc6Nq2o8u8wKikgrK/Wq4DPnzybIrQYErAqTibpsD/wfaC+9dI66/hEQeaxn3htraN/+Nfefzt/dKl3250/AN5UV1zGcY+kfpAOO4pJWLyPAfH8xJf++jTMxJIzWjGoweJL0Q29ke8sjG6ZiLwnd25j7bLgni3vmPibjeEHcoiDXbzcCqALi6K9YNrXQp9EbaFLT6Fxx5REVs1M2qWhm2dXc8Cu2ErCVyZyqiyLIGJvHyrSssSVAXGKCNUzujKVKw0YKDSTGhcUqWV0fz2xObyqIStBHRP3+77AZjEzns3bMPQueYswgbbfu79E14MCZVCRqMUmz9gVu8FZO39CROI42cYX0aVUip1RolllNSKmd+4UNbHn8bZvXB0BAAA",
      nextJumpId: -2,
    });

    const options = {
      hostname: "localhost",
      port: 3001,
      path: "/jump",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const allData: string[] = [];
    const req = http.request(options, (res) => {
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        allData.push(chunk);
      });

      res.on("end", () => {
        const gameJson = JSON.parse(allData.join());
        assert.equal(
          gameJson.stageInfo.text,
          "Хватило и секунды, что бы понять отчего полуорк потянулся за оружие. Даже сквозь шум вьюги слышался отдаленный вой снежных волков. Один, потом второй. Реординарт насчитал по меньшей мере шесть источников воя.",
        );
      });
    });
    req.write(postData);
    req.end();
  });

  it("Api server stop", function () {
    server.close(() => {
      assert.ok(true);
    });
  });
});
