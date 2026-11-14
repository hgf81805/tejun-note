# 手順ノート

手順書の検索・閲覧・編集アプリ。Supabase AuthとPostgresに接続し、ログイン本人の手順書だけを閲覧・編集できます。

## 利用

公開URL: https://hgf81805.github.io/tejun-note/

1. 「ログイン」から登録済みのメールアドレスとパスワードでログインします。
2. アカウントは管理者がSupabase Dashboard → Authentication → Usersで登録します。メール確認を使わない場合は確認済み（Auto Confirm User）として作成します。
3. 「手順書を追加」で作成し、「DBに保存しました」の表示を確認します。
4. 旧版のlocalStorageデータは同じURL・ブラウザでログイン後、「このブラウザの手順書を取り込む」で移行できます。取り込みは同じIDのDBレコードを上書きせず、localStorageの原本も削除しません。
5. 「サンプルを追加」で例を取り込めます。サンプル手順は社内ルールに合わせて編集してください。

Sites版とGitHub Pages版は別オリジンです。Sites版のブラウザデータはこの画面から直接読み取れません。

## Supabase

接続設定: `config.js`。ブラウザ公開用publishable keyのみを使います。service_roleやsecret keyは入れないでください。

専用テーブル: `public.tejun_documents`。`database/tejun_documents.sql` にスキーマとポリシーを記録しています。既存プロジェクトには適用済みです。

- RLSで `auth.uid() = owner_id` を強制し、匿名認証セッションも拒否します。
- DBへの書き込みが成功するまで画面を保存済みにしません。
- revisionで同時編集を検知します。競合時は「再読み込み」後に編集し直してください。
- お気に入りも本人のDBに保存されます。

アプリ内の新規登録・メール認証・リダイレクト認証は利用しません。SupabaseのURL設定は不要です。プロジェクト全体の認証設定は変更していません。

## 開発

静的Webサーバーでこのディレクトリを配信します。通常のデプロイにビルドは不要です。

SDK更新時のみ `npm ci` → `npm run build:sdk` で `vendor/supabase.js` を更新し、package-lock.jsonとともにコミットしてください。使用バージョンはpackage.jsonで固定しています。

`main` へのpushでGitHub ActionsがPagesを自動更新します。
