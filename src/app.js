import Koa from "koa";
import Router from "@koa/router";
import http from "http";
import cors from "@koa/cors";
import dotenv from "dotenv";
import { koaBody } from "koa-body";
import { registerOpenAIRoutes } from "./routes/openai.js";


dotenv.config();

const main = async () => {
  const app = new Koa();
  const router = new Router();
  registerOpenAIRoutes(router)

  app.use(cors());
  app.use(koaBody({ multipart: true, urlencoded: true, json: true }));
  app.use(router.routes()).use(router.allowedMethods());

  const server = http.createServer(app.callback());
  const host = "0.0.0.0";
  const port = process.env.PORT || 4182;
  server.listen(port, host, () => {
    console.log(`The Server is running http://localhost:${port}`);
  });
};

main();
