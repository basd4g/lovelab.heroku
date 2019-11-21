import * as express from "express";
import { Groups } from "../../models/groups";
import { Users } from "../../models/users";

const router = express.Router();

// /groups グループに関する操作

// /groups:groupid/tasks タスクに関する操作

// GET https://lovelab.2n2n.ninja/api/v1/groups/:groupid/tasks
//  グループのタスク一覧を取得 自分の所属するグループのみ取得可能
// POST https://lovelab.2n2n.ninja/api/v1/groups/:groupid/tasks
//  タスクを追加 自分の所属するグループのみ追加可能
// GET https://lovelab.2n2n.ninja/api/v1/groups/:groupid/tasks/:taskid
//  タスクの詳細を取得 自分の所属するグループのみ取得可能
// PUT https://lovelab.2n2n.ninja/api/v1/groups/:groupid/tasks/:taskid
//  タスクを完了 自分の所属するグループのみ編集可能

interface GroupResponceObject {
  id: number;
  name: string;
  picturepath: string;
}
const groupResponceObjectFilter = (
  group: GroupResponceObject
): GroupResponceObject => {
  const { id, name, picturepath } = group;
  return { id, name, picturepath };
};
const validate = (str: string): boolean => {
  if (str === undefined || str === null || str === "") {
    return false;
  }
  return true;
};

// GET https://lovelab.2n2n.ninja/api/v1/groups/:groupid
//  グループの情報を取得
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id) || id < 0) {
    res.json({ error: true, errorMessage: "Invalid groupid" });
    return;
  }
  Groups.findByPk(id)
    .then(group => {
      if (group === null) {
        res.json({ error: true, errorMessage: "group is not found" });
        return;
      }
      res.json(groupResponceObjectFilter(group));
    })
    .catch(() => {
      res.json({ error: true, errorMessage: "Database error" });
    });
  /*
  res.json({
    id: req.params.id,
    name: "group name",
    groupid: 0,
    updatedtimestamp: 0,
    picturepath:
      "https://www.dropbox.com/s/szjeyvrmd4z047y/GettyImages-522585140.jpg?dl=0"
  });
 */
});

// POST https://lovelab.2n2n.ninja/api/v1/groups?userid=:userid
//  グループを追加 自分が強制的にそのグループに所属することになる
router.post("/", (req, res) => {
  const { userid } = req.params; // TODO: アクセスしてきたuserのidを取り込む 現状ユーザーidがわからないと動かないので、クエリで入れる仕様としている
  if (Number.isNaN(userid)) {
    res.json({ error: true, errorMessage: "invalid query of userid" });
    return;
  }
  const { name, picturepath } = req.body;
  if (!validate(name)) {
    res.json({ error: true, errorMessage: "invalid name" });
    return;
  }
  // TODO: 自分がグループに所属していないことを確認
  // TODO: groupをcreate
  Groups.create({ name, picturepath }).then(group => {
    // 自分のgroupidを作ったグループのidに変更
    const groupid = group.id;
    Users.update({ groupid }, { where: { id: userid } })
      .then(() => {
        // 作ったグループをresponce
        res.json(groupResponceObjectFilter(group));
      })
      .catch(() => {
        Groups.destroy({ where: { id: groupid } })
          .then(() => {
            res.json({
              error: true,
              errorMessage:
                "failed to update your groupid. And don't create new group"
            });
          })
          .catch(() => {
            res.json({
              error: true,
              errorMessage:
                "created group and failed to update your groupid, but failed to delete new group"
            });
          });
      });
  });
});
// routerをモジュールとして扱う準備
export default router;