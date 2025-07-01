# ローカルでのデバッグ方法

```
$ ts-node index.ts
```

* 普通に上記のコマンドを打ち込んでも cron が動くだけなので、デバッグをしたい場合は `index.ts` を以下のようにする

```ts
client.on('ready', () => {
  console.log('ready to send');
  wedJob.start();
  satJob.start();
  // デバッグ用の処理を仕込む
  execute();
  console.log('cron job start');
});
```

# 注意点

* 上記の `execute()` を実行すると実際に Discord にてメンションが飛ばされます。
* `execute()` の `sendMessage()` を必ずコメントアウトしましょう

```ts
const execute = () => {
  loadMembersFromSheet().then(async (membersAndRule: MembersAndRule) => {
    if (membersAndRule.members.length === 0) {
      return;
    }
    let message = await yieldNoticeMessage(membersAndRule);
    yieldMemberListMessage(membersAndRule.members).then(async (m: string) => {
      message = await `${message}\n${m}`;
      // ↓これをコメントアウト
      //sendMessage(await message, client);
      console.log('sent a message');
    })
  })
}
```
