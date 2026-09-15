import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import fs from "fs";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

const possibleClientPaths = [
  path.resolve(process.cwd(), "artifacts/jett-booking/dist/public"),
  path.resolve(process.cwd(), "../jett-booking/dist/public"),
  path.resolve(process.cwd(), "dist/public"),
];
const clientDistPath =
  possibleClientPaths.find((p) => fs.existsSync(p)) || possibleClientPaths[0];

app.use(express.static(clientDistPath));

app.use((req, res, next) => {
  if (req.method !== "GET" || req.path.startsWith("/api")) {
    return next();
  }
  const indexHtml = path.join(clientDistPath, "index.html");
  if (fs.existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    res.status(200).send("JETT Booking App is initializing...");
  }
});

export default app;
