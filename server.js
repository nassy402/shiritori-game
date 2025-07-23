// server.js
import { serveDir } from "jsr:@std/http/file-server";

// 直前の単語を保持する変数をグローバル領域に定義
let previousWord = "しりとり"; // ゲームの初期単語

// localhostにDenoのHTTPサーバーを展開
Deno.serve(async (_req) => {
    // パス名を取得する
    const pathname = new URL(_req.url).pathname;
    console.log(`pathname: ${pathname}`); // ターミナルにパス名を出力

  // POST /shiritori: 次の単語を受け取って保存する
if (_req.method === "POST" && pathname === "/shiritori") {
    try {
        const requestJson = await _req.json();
        const nextWord = requestJson["nextWord"];

        if (typeof nextWord !== 'string' || nextWord.length === 0) {
            console.log(`POST /shiritori: Invalid input - nextWord is not a valid string.`);
            return new Response("ルール違反: 有効な単語が送信されていません。", { status: 400, headers: { "Content-Type": "text/plain; charset=utf-8" } }); // ★ここを修正
        }

        if (previousWord.slice(-1) === nextWord.slice(0, 1)) {
            previousWord = nextWord;
            console.log(`POST /shiritori: previousWord updated to ${previousWord}`);
            return new Response(previousWord, { headers: { "Content-Type": "text/plain; charset=utf-8" } }); // ★ここを修正
        } else {
            console.log(`POST /shiritori: Rule violation - '${previousWord}' ends with '${previousWord.slice(-1)}', but '${nextWord}' starts with '${nextWord.slice(0, 1)}'.`);
            return new Response("ルール違反: 前の単語と繋がりません。", { status: 400, headers: { "Content-Type": "text/plain; charset=utf-8" } }); // ★ここを修正
        }
    } catch (error) {
        console.error(`POST /shiritori error: ${error.message}`);
        return new Response("サーバーエラー: リクエストの処理中に問題が発生しました。", { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8" } }); // ★ここを修正
    }
}

    // 上記のAPIパスに該当しない場合、./public以下の静的ファイルを公開
    // serveDirが自動的にファイルを公開するため、個別のパス判定は不要
    return serveDir(
        _req,
        {
            fsRoot: "./public/", // 公開するフォルダを指定
            urlRoot: "",         // URLのルートに直に展開
            enableCors: true,    // CORSを有効にする
        }
    );
});