# CodexNative Web

CodexNative Web は ChatGPT Web のモデルをネイティブ Codex ワークフローへ統合し、ストリーミング、コンテキスト、MCP、ローカルツール、コンテキスト圧縮を維持します。本プロジェクトは Web のみを使用し、OpenAI API key は不要です。

公式リポジトリ：`erlancarreira/codex-chatgpt-web`

## クイックインストール

Windows：


```powershell
irm https://raw.githubusercontent.com/erlancarreira/codex-chatgpt-web/main/scripts/install-launcher.ps1 | iex
```

macOS / Linux：

```bash
curl -fsSL https://raw.githubusercontent.com/erlancarreira/codex-chatgpt-web/main/scripts/install-launcher.sh | sh
```

## ソースから実行

Bun 1.4.0 が必要です。

```bash
git clone https://github.com/erlancarreira/codex-chatgpt-web.git
cd codex-chatgpt-web

検証：

bun install --frozen-lockfile
bun run app
```

## 実行モード

- **Browser-only**：ChatGPT Web のみ。tunnel は不要です。
- **Full Harness**：MCP/tunnel 経由で terminal、filesystem、tools を利用します。
- **Zero Risk**：Web ターンを手動送信し、専用 tunnel を利用します。

各ユーザーは自分自身の ChatGPT ログイン、Tunnel ID、Tunnels Read + Use API key を使用してください。ブラウザープロファイル、runtime ディレクトリ、キーを共有しないでください。

## 診断と tunnel

```bash
bun run typecheck
bun test
bun run build
```

最小ヘルスチェック：

```bash
codex-chatgpt-web route status
codex-chatgpt-web route connect
codex-chatgpt-web route disconnect

## 更新

Windows：

codex-chatgpt-web doctor
codex-chatgpt-web browser check

macOS / Linux：

codex-chatgpt-web tunnel status
codex-chatgpt-web tunnel start
codex-chatgpt-web tunnel restart
codex-chatgpt-web tunnel stop
```

## 開発

Bun 1.4.0 が必要です。

```bash
codex-chatgpt-web doctor
codex-chatgpt-web route status
codex-chatgpt-web tunnel status
```

launcher の起動：

```powershell
irm https://raw.githubusercontent.com/erlancarreira/codex-chatgpt-web/main/scripts/install-launcher.ps1 | iex
```

<!--
Version sync:
  /releases/download/v6.1.3/codex-web-gpt-6.1.3-win-x64.exe
  /releases/download/v6.1.3/codex-web-gpt-6.1.3-mac-arm64.dmg
  /releases/download/v6.1.3/codex-web-gpt-6.1.3-mac-x64.dmg
  /releases/download/v6.1.3/codex-web-gpt-6.1.3-linux-x64.AppImage
-->

## Documentation

- [Installation and operations](docs/codexnative-web.md)
- [Architecture](docs/architecture.md)
- [Security](docs/security-model.md)
- [Release validation](docs/release-validation.md)
- [Troubleshooting](TROUBLESHOOTING.md)
- [License](LICENSE)
- [Third-party licenses](LICENSES)
