import * as express from "express";
import * as bodyParser from "body-parser";
import authorization from "./middleware/authorization";
import typeCheck from "./middleware/typeCheck";
import routerV1 from "./routes/v1/index";
import routerV1authed from "./routes/v1/authed/index";

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/api/v1", typeCheck);

app.use("/api/v1", routerV1);

// Authorization
app.use("/api/v1/authed", authorization);

app.use("/api/v1/authed", routerV1authed);

export default app;
