# CodexNative Web

CodexNative Web은 ChatGPT Web 모델을 네이티브 Codex 워크플로에 통합하면서 스트리밍, 컨텍스트, MCP, 로컬 도구 및 컨텍스트 압축을 유지합니다. 이 프로젝트는 Web 전용이며 OpenAI API key가 필요하지 않습니다.

공식 저장소: `erlancarreira/codex-chatgpt-web`

## 빠른 설치

Windows:


```powershell
irm https://raw.githubusercontent.com/erlancarreira/codex-chatgpt-web/main/scripts/install-launcher.ps1 | iex
```

macOS / Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/erlancarreira/codex-chatgpt-web/main/scripts/install-launcher.sh | sh
```

## 소스에서 실행

Bun 1.4.0이 필요합니다.

```bash
git clone https://github.com/erlancarreira/codex-chatgpt-web.git
cd codex-chatgpt-web

검증:

bun install --frozen-lockfile
bun run app
```

## 실행 모드

- **Browser-only**: ChatGPT Web만 사용하며 tunnel이 필요하지 않습니다.
- **Full Harness**: MCP/tunnel을 통해 terminal, filesystem, tools를 사용합니다.
- **Zero Risk**: Web turn을 수동으로 전송하고 별도 tunnel을 사용합니다.

각 사용자는 자신의 ChatGPT 로그인, Tunnel ID, Tunnels Read + Use API key를 사용해야 합니다. 브라우저 프로필, runtime 디렉터리 또는 키를 공유하지 마십시오.

## 진단 및 tunnel

```bash
bun run typecheck
bun test
bun run build
```

최소 상태 확인:

```bash
codex-chatgpt-web route status
codex-chatgpt-web route connect
codex-chatgpt-web route disconnect

## 업데이트

Windows:

codex-chatgpt-web doctor
codex-chatgpt-web browser check

macOS / Linux:

codex-chatgpt-web tunnel status
codex-chatgpt-web tunnel start
codex-chatgpt-web tunnel restart
codex-chatgpt-web tunnel stop
```

## 개발

Bun 1.4.0이 필요합니다.

```bash
codex-chatgpt-web doctor
codex-chatgpt-web route status
codex-chatgpt-web tunnel status
```

launcher 실행:

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
