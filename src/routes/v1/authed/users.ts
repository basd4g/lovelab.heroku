import * as express from "express";
import { Users } from "../../../models/users";
import { userResponceObjectFilter } from "../../../others/users";

const router = express.Router();

// GET https://lovelab.2n2n.ninja/api/v1/users?groups=:groupid
//  グループに所属するユーザーを取得
router.get("/", (req, res) => {
  if (req.query.groupid === undefined) {
    res.json({ error: true, errorMessage: "Need to specify groupid" });
    return;
  }
  const groupid = parseInt(req.query.groupid, 10);
  if (Number.isNaN(groupid) || groupid < 0) {
    res.json({ error: true, errorMessage: "Invalid groupid" });
    return;
  }
  Users.findAll({ where: { groupid } }).then(users => {
    res.json(
      users.map(user => {
        return userResponceObjectFilter(user);
      })
    );
  });
});

// GET https://lovelab.2n2n.ninja/api/v1/users/:id
//  ユーザー情報を取得
router.get("/:userid", (req, res) => {
  const userid = parseInt(req.params.userid, 10);
  if (Number.isNaN(userid) || userid < 0) {
    res.json({ error: true, errorMessage: "Invalid userid" });
    return;
  }
  Users.findByPk(userid).then(user => {
    if (user === null) {
      res.json({ error: true, errorMessage: "user is not found" });
      return;
    }
    res.json(userResponceObjectFilter(user));
  });
});

// routerをモジュールとして扱う準備
export default router;