import * as express from "express";
import * as bodyParser from "body-parser";
import connectDataBase from "./db";
import authorization from "./middleware/authorization";
import routerV1 from "./routes/v1/index";
import routerV1authed from "./routes/v1/authed/index";

// sha256 テスト

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

app.use("/api/v1", routerV1);

// Authorization
app.use("/api/v1/authed", authorization);

app.use("/api/v1/authed", routerV1authed);

// サーバ起動
app.listen(port);
// eslint-disable-next-line no-console
console.log(`listen on port ${port}`);

const forceReset = process.argv[2] === "--reset";
console.log(`forceReset: ${forceReset}`);
connectDataBase(forceReset);
