# lovelab.heroku API仕様書

lovelab.herokuのAPIに関する仕様を記す。

2019/11/24時点での仕様。

## 概略

lovelabのWebサーバにあるデータベース内の情報を取得/変更する際に、APIと通信して情報を送受信する。

HTTPS通信で、jsonデータを送受信(一部は受信のみ)することで利用できる。

- APIの送受信するデータ形式: json
- 認証が必要な場合の方式: Bearerトークン
- エンドポイント `https://lovelab.2n2n.ninja/api/v1/*`( 以下は`https://lovelab.2n2n.ninja/api/v1`以下のURIを記載する

## 認証

APIは一部認証が必要である。
認証は、特定のユーザー以外がAPIを使って情報を操作することを防ぐために行う。
具体的な方法は後術。

### 認証の有無

| 認証の有無 | エンドポイント |
----|----
| 認証あり | `/authed/` |
| 認証なし | `/` (ただし/authed以下を除く)  |

認証の有無に関しては次章以降の各エンドポイントの説明にも記載する。

### 認証の方法

HTTPヘッダに`Authorization: Bearer トークン`を付加してリクエストを送信する。

参考資料

- [トークンを利用した認証・認可 API を実装するとき Authorization: Bearer ヘッダを使っていいのか調べた - Qiita](https://qiita.com/uasi/items/cfb60588daa18c2ec6f5)
- [OAuth 2.0のbearer tokenの最新仕様を調べたらあまり変わってなかった](https://ritou.hatenablog.com/entry/20110402/1301679908)
- [Authorization Bearer ヘッダを用いた認証 API の実装](https://www.getto.systems/entry/2017/10/19/004734)

### トークンの有効期限

有効期限はログイン時から30日間。

### Bearerトークンを取得する

POST /login の項を参照のこと。ログインに成功するとレスポンスボディのjsonの中身としてトークンが取得できる。

## 成功と失敗

(未執筆)成功した場合は200 失敗した場合は401...

## 実際にAPIと通信してみる

以下では、terminalのcrulコマンドと[Postman](https://www.getpostman.com/)で実際にAPIと通信する手順を解説する。

### 認証無しのリクエストを試してみる

#### curlで通信

```sh
# ユーザ登録
$ curl "https://lovelab.2n2n.ninja/api/v1/signup" \
       -X POST \
       -H "Content-Type: application/json" \
       -d '{"email":"charlie@example.com","password":"charlie-password","name":"charlie"}' 
# ログイン(Beaerトークンを取得)
$ curl "https://lovelab.2n2n.ninja/api/v1/login" \
       -X POST \
       -H "Content-Type: application/json" \
       -d '{"email":"charlie@example.com","password":"charlie-password"}' 
```

#### Postmanで通信

未執筆

### 認証付きのリクエストを試してみる

#### curlで通信

terminalで次のコマンドを実行

```sh
# ユーザ情報を取得
$ curl "https://lovelab.2n2n.ninja/api/v1/authed/users/1" \
       -H "Content-Type: application/json" \
       -H "Authorization: Bearer xxxx" \
       -X GET
# xxxx は取得したAPIキーを利用
```

#### Postmanで通信

1. リクエストのAuthorizationタブを開き、TYPEを`Bearer Token`に設定
1. Tokenにトークンを入力
1. HTTPリクエストメソッド(GET,POST,PUT,DELETE)を設定
1. URIを設定
1. (必要があれば)リクエストのBodyタブでrawを選択し、JSONを設定
1. Send

![postman.png](postman_auth.png)

#### Swiftで送信する

未調査... 頑張ってください....

## <各エンドポイントの仕様> に関して

これより下は各エンドポイントの詳細仕様を記す。

注意:

URIに含む`:id`はそのまま打つのではなく適宜任意の数字などに置き換えて読む。

各種idはAPI側で決定される。どのidが指定されるかはユーザ側では選べない。
また、そのidのレコードが削除されても、それ以降別のレコードに同じidが振られることはない。

### 目次(API一覧)

| 操作名 | 認証の有無 | HTTPメソッド | URI末尾 |
----|----|----|----
| [新規ユーザ登録](#新規ユーザ登録) | 無し | POST | `/signup` |
| [既存ユーザログイン](#既存ユーザログイン) | 無し | POST | `/login` |
| [特定のグループに所属するユーザ達の情報を取得](#特定のグループに所属するユーザ達の情報を取得) | 有り | GET | `/authed/users?groupid=:id` |
| [特定のユーザの情報を取得](#特定のユーザの情報を取得) | 有り | GET | `/authed/users/:id` |
| [新しい招待を作成](#新しい招待を作成) | 有り | POST | `/authed/invitations` |
| [特定の招待を拒否](#特定の招待を拒否)| 有り | DELETE | `/authed/invitations/:id` |
| [特定の招待を承諾](#特定の招待を承諾) | 有り | DELETE | `/authed/invitations/:id?agreement=true` |
| [グループの情報を取得](#グループの情報を取得) | 有り | POST | `/authed/groups/:id` |
| [新規グループ作成](#新規グループ作成)| 有り | POST | `/authed/groups` |
| [グループのタスクをすべて取得](#グループのタスクをすべて取得) | 有り | GET | `/authed/tasks` |
| [特定のタスクの情報を取得](#特定のタスクの情報を取得)| 有り | GET | `/authed/tasks/:id` |
| [特定のタスクの内容を変更](#特定のタスクの内容を変更)| 有り | PUT | `/authed/tasks/:id` |

### 一例

#### そのエンドポイントでできる操作名

- 操作の説明
- HTTPリクエストメソッド(GET,POST,PUT,DELETE) ... (以下HTTPメソッドと表記)
- エンドポイントのURI( https://lovelab.2n2n.ninja 以下の文字列)
- (必要な場合)リクエストボディ
- (存在する場合)レスポンスボディ

などを記す。

リクエスト/レスポンスのbodyは特記がなければ原則json形式

## 認証に関する操作 <各エンドポイントの仕様>

### 新規ユーザ登録

| 認証の有無 | HTTPメソッド | URI末尾 |
----|----|----
| 無し | POST | `/signup` |

#### リクエストbody

| キー | データ型 | 必須/任意 | 説明 |
----|----|----|----
| email | 文字列 | 必須 | ログイン時にユーザを識別することを目的とした文字列(現在はメールアドレスでなくても任意の文字列で登録可能) |
| password | 文字列 | 必須 | 各ユーザーが決めたログイン用パスワード |
| name | 文字列 | 任意 | ユーザーの決めた表示名 |

#### レスポンスbody

| キー | データ型 | 説明 |
----|----|----
| groupid | null | グループid(数字) ユーザ作成時は未加入のため必ずnullが返る |
| picturepath | 文字列 | ユーザのアイコン画像のパス用の文字列フィールド(現在未使用) |
| id | 数字 | ユーザの識別番号 サーバ側でアカウント作成時に決定 |
| email | 文字列 | ユーザを識別する目的の文字列 |
| name | null または 文字列 | ユーザの決めた表示名 |

#### サーバ内の状態変化

新しいユーザのレコードが追加される

### 既存ユーザログイン

| 認証の有無 | HTTPメソッド | URI末尾 |
----|----|----
| 無し | POST | `/login` |

#### リクエストbody

| キー | データ型 | 必須/任意 | 説明 |
----|----|----|----
| email | 文字列 | 必須 | 事前に登録されたユーザ識別用文字列 |
| password | 文字列 | 必須 | 各ユーザーが決めたログイン用パスワード |

#### レスポンスbody

| キー | データ型 | 説明 |
----|----|----
| userid | 数字 | ユーザの識別番号 サーバ側でアカウント作成時に決定 |
| token | 文字列 | 認証に利用するBearerトークン |
| deadline | 文字列 | トークンの有効期限 "2019-12-23T17:14:19.117Z" |

#### サーバ内の状態変化

新しいトークンのレコードが発行・追加される

## ユーザに関する操作 <各エンドポイントの仕様>

### 特定のグループに所属するユーザ達の情報を取得

注意: 認証が必要ですが、認証に成功すれば、どのグループのユーザ情報も取得できます。

| 認証の有無 | HTTPメソッド | URI末尾 |
----|----|----
| 有り | GET | `/authed/users?groupid=:id` |

:id には グループid(数字)を渡す

#### リクエストbody

無し

#### レスポンスbody

以下のkey-valueを持ったオブジェクトの配列(長さ0以上)が返る

| キー | データ型 | 説明 |
----|----|----
|  |  |  |
|  |  |  |
|  |  |  |

#### サーバ内の状態変化

特になし

### 特定のユーザの情報を取得

注意: 認証が必要ですが、認証に成功すれば、すべてのユーザの情報も取得できます。

| 認証の有無 | HTTPメソッド | URI末尾 |
----|----|----
| 有り | GET | `/authed/users/:id` |

:id には ユーザid(数字)を渡す

#### リクエストbody

無し

#### レスポンスbody

| キー | データ型 | 説明 |
----|----|----
|  |  |  |
|  |  |  |
|  |  |  |

#### サーバ内の状態変化

特になし

## 招待に関する操作 <各エンドポイントの仕様>

### 新しい招待を作成

| 認証の有無 | HTTPメソッド | URI末尾 |
----|----|----
| 有り | POST | `/authed/invitations` |

#### リクエストbody

| キー | データ型 | 必須/任意 | 説明 |
----|----|----|----
| inviteeuserid | 数字 | 必須 | 招待相手のユーザid |
| message | 文字列 | 必須? | 招待相手に見せたいメッセージ |

#### レスポンスbody

| キー | データ型 | 説明 |
----|----|----
|  |  |  |
|  |  |  |
|  |  |  |

#### サーバ内の状態変化

新しいトークンのレコードが発行・追加される

### 自分への招待をすべて取得

| 認証の有無 | HTTPメソッド | URI末尾 |
----|----|----
| 有り | GET | `/authed/invitations` |

#### リクエストbody

無し

#### レスポンスbody

| キー | データ型 | 説明 |
----|----|----
|  |  |  |
|  |  |  |
|  |  |  |

#### サーバ内の状態変化

### 特定の招待を拒否

DELETE /authed/invitations/:id

| 認証の有無 | HTTPメソッド | URI末尾 |
----|----|----
| 有り | DELETE | `/authed/invitations/:id` |

`:id`は招待id(数字)に置き換える

#### リクエストbody

無し

#### レスポンスbody

| キー | データ型 | 説明 |
----|----|----
|  |  |  |
|  |  |  |
|  |  |  |

#### サーバ内の状態変化

### 特定の招待を承諾

| 認証の有無 | HTTPメソッド | URI末尾 |
----|----|----
| 有り | DELETE | `/authed/invitations/:id?agreement=true` |

`:id`は招待id(数字)に置き換える

#### リクエストbody

無し

#### レスポンスbody

| キー | データ型 | 説明 |
----|----|----
|  |  |  |
|  |  |  |
|  |  |  |

#### サーバ内の状態変化

## グループに関する操作 <各エンドポイントの仕様>

### グループの情報を取得

| 認証の有無 | HTTPメソッド | URI末尾 |
----|----|----
| 有り | POST | `/authed/groups/:id` |

`:id`はグループid(数字)に置き換える

#### リクエストbody

| キー | データ型 | 必須/任意 | 説明 |
----|----|----|----
|  |  |  |  |
|  |  |   |

#### レスポンスbody

| キー | データ型 | 説明 |
----|----|----
|  |  |  |
|  |  |  |
|  |  |  |

#### サーバ内の状態変化

### 新規グループ作成

グループに所属していないユーザのみ実行可能
新規に作成されたグループに、強制的にアクセスしたユーザが加盟する

| 認証の有無 | HTTPメソッド | URI末尾 |
----|----|----
| 有り | POST | `/authed/groups` |

#### リクエストbody

| キー | データ型 | 必須/任意 | 説明 |
----|----|----|----
|  |  |  |  |
|  |  |   |

#### レスポンスbody

| キー | データ型 | 説明 |
----|----|----
|  |  |  |
|  |  |  |
|  |  |  |

#### サーバ内の状態変化

## タスクに関する操作 <各エンドポイントの仕様>

### グループのタスクをすべて取得

GET /authed/tasks

| 認証の有無 | HTTPメソッド | URI末尾 |
----|----|----
| 有り | GET | `/authed/tasks` |

#### リクエストbody

| キー | データ型 | 必須/任意 | 説明 |
----|----|----|----
|  |  |  |  |
|  |  |  |  |

#### レスポンスbody

| キー | データ型 | 説明 |
----|----|----
|  |  |  |
|  |  |  |
|  |  |  |

#### サーバ内の状態変化

### 特定のタスクの情報を取得

自分の所属するグループのタスクのみ取得可能

### タスクを追加

| 認証の有無 | HTTPメソッド | URI末尾 |
----|----|----
| 有り | GET | `/authed/tasks/:id` |

`:id`はタスクid(数字)に置き換える

#### リクエストbody

| キー | データ型 | 必須/任意 | 説明 |
----|----|----|----
|  |  |  |  |
|  |  |  |  |

#### レスポンスbody

| キー | データ型 | 説明 |
----|----|----
|  |  |  |
|  |  |  |
|  |  |  |

#### サーバ内の状態変化

### 特定のタスクの内容を変更

例えば、タスクを完了する操作など

| 認証の有無 | HTTPメソッド | URI末尾 |
----|----|----
| 有り | PUT | `/authed/tasks/:id` |

`:id`はタスクid(数字)に置き換える

#### リクエストbody

| キー | データ型 | 必須/任意 | 説明 |
----|----|----|----
|  |  |  |  |
|  |  |  |  |

#### レスポンスbody

| キー | データ型 | 説明 |
----|----|----
|  |  |  |
|  |  |  |
|  |  |  |

#### サーバ内の状態変化