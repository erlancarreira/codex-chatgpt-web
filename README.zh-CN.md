# CodexNative Web

CodexNative Web 将 ChatGPT Web 模型集成到原生 Codex 工作流中，并保留流式输出、上下文、MCP、本地工具与上下文压缩能力。本项目只使用 Web 模式，不要求 OpenAI API key。

官方仓库：`erlancarreira/codex-chatgpt-web`

## 快速安装

Windows：


```powershell
irm https://raw.githubusercontent.com/erlancarreira/codex-chatgpt-web/main/scripts/install-launcher.ps1 | iex
```

macOS / Linux：

```bash
curl -fsSL https://raw.githubusercontent.com/erlancarreira/codex-chatgpt-web/main/scripts/install-launcher.sh | sh
```

## 从源代码运行

需要 Bun 1.4.0。

```bash
git clone https://github.com/erlancarreira/codex-chatgpt-web.git
cd codex-chatgpt-web

验证：

bun install --frozen-lockfile
bun run app
```

## 运行模式

- **Browser-only**：只使用 ChatGPT Web，不需要 tunnel。
- **Full Harness**：通过 MCP/tunnel 使用终端、文件系统与工具。
- **Zero Risk**：手动发送 Web 回合，并使用独立 tunnel。

每位用户都应使用自己的 ChatGPT 登录、Tunnel ID 与 Tunnels Read + Use API key。不要共享浏览器配置文件、运行时目录或密钥。

## 诊断与 tunnel

```bash
bun run typecheck
bun test
bun run build
```

最小健康检查：

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

## 开发

需要 Bun 1.4.0。

```bash
codex-chatgpt-web doctor
codex-chatgpt-web route status
codex-chatgpt-web tunnel status
```

启动 launcher：

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
