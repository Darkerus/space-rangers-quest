import express from "express";
import { QMStepGame } from "./QMStepGame";
import { decompressToObject, compressObject } from "./compressor";
import QMApp from "./app";

const app = new QMApp();

app.listen(3001, "localhost", () => console.log("I'm Work!"));
