# CodexNative Web

CodexNative Web é a distribuição mantida neste repositório para executar modelos do ChatGPT Web dentro do fluxo nativo do Codex, com integração de browser, Responses bridge, MCP, ferramentas locais, streaming e compactação de contexto.

Este projeto deriva de `miuuyy/codex-chatgpt-web`, mas passa a ser tratado como uma linha de manutenção própria. O objetivo é permitir que as correções e decisões deste fork evoluam sem confundir o estado do upstream com o estado validado aqui.

> **Repositório desta distribuição:** `erlancarreira/codex-chatgpt-web`
>
> **Upstream de origem:** `miuuyy/codex-chatgpt-web`

## Identidade do projeto

O nome de produto usado nesta documentação é **CodexNative Web**.

Por compatibilidade, alguns identificadores internos ainda mantêm os nomes históricos `codex-chatgpt-web` e `Codex Web GPT`. Isso inclui, entre outros:

- comando `codex-chatgpt-web`;
- diretório de runtime `~/.codex-chatgpt-web`;
- nome atual do launcher `Codex Web GPT`;
- aliases e perfis internos já usados pelo tunnel/runtime;
- partição persistente do browser.

Essa decisão evita uma migração destrutiva e permite atualizar uma instalação existente sem perder login, configurações, runtime, integrações ou estado local.

### Importante: não instalar upstream e fork lado a lado

No estado atual, CodexNative Web é um projeto separado no Git, mas **não é uma instalação isolada do upstream no mesmo usuário do sistema operacional**.

Como os identificadores de runtime e perfil ainda são compartilhados, instalar uma release do upstream depois deste fork pode substituir arquivos ou alterar a configuração usada pelo CodexNative Web.

Para uma máquina que usa esta distribuição, mantenha apenas o canal deste fork.

Uma futura separação física completa exigiria uma mudança coordenada de `appId`, diretórios de perfil, browser partition, runtime home, serviços e aliases de tunnel. Isso deve ser tratado como uma migração própria, não como uma simples troca de nome.

## O que esta distribuição adiciona

Além da base do upstream, esta linha contém correções e endurecimentos implementados e validados para o uso real no Windows e no fluxo Codex + ChatGPT Web.

Entre as mudanças principais estão:

- correções no broker de turnos e no ciclo de vida de named pipes no Windows;
- recuperação automática do tunnel gerenciado após reinicialização do runtime;
- integração do Codex usando o provider nativo `openai` e bridge local;
- observação do lifecycle do turno também pela rede/CDP, reduzindo dependência exclusiva do DOM;
- recuperação de surface sem aceitar silenciosamente uma conversa não relacionada;
- tratamento de `net::ERR_ABORTED` após resposta HTTP válida e dados já recebidos como transição possível da SPA, e não como falha automática do turno;
- compactação de contexto com serialização da projeção final, sem tratar reescritas provisórias do renderer como retração de texto já entregue ao Codex;
- diagnósticos por turno em `~/.codex-chatgpt-web/diagnostics/browser-turns`.

Commits de referência desta linha:

- `c44f755` — Windows turn broker, compaction e tunnel recovery;
- `d238e71` — network tracking do turno do ChatGPT;
- `43db4f3` — compactação com renderer rewrite e tratamento de aborted streams.

## Modelo de instalação

Existem dois canais de instalação.

### 1. Release do CodexNative Web — recomendado

Quando uma release desta distribuição estiver publicada em `erlancarreira/codex-chatgpt-web`, o launcher deve ser instalado a partir **deste fork**, não do upstream.

Os instaladores desta distribuição usam `erlancarreira/codex-chatgpt-web` como canal padrão de releases. As variáveis `CODEX_WEB_GPT_REPOSITORY` e `CODEX_CHATGPT_WEB_REPOSITORY` continuam disponíveis apenas para desenvolvimento, mirrors ou testes controlados.

#### Windows PowerShell

```powershell
irm https://raw.githubusercontent.com/erlancarreira/codex-chatgpt-web/main/scripts/install-launcher.ps1 | iex
```

O instalador resolve a release mais recente deste fork, baixa o artefato apropriado para Windows e usa os checksums publicados pela release.

#### macOS / Linux

```bash
curl -fsSL   https://raw.githubusercontent.com/erlancarreira/codex-chatgpt-web/main/scripts/install-launcher.sh | sh
```

O mesmo princípio vale para atualizações: o launcher e os scripts verificam releases em `erlancarreira/codex-chatgpt-web`, não no upstream.

> Antes da primeira release binária do fork, use a instalação por código-fonte descrita abaixo.

### 2. Instalação por código-fonte

Requisitos:

- Git;
- Bun **1.4.0**;
- acesso ao repositório;
- Codex instalado separadamente.

```bash
git clone https://github.com/erlancarreira/codex-chatgpt-web.git
cd codex-chatgpt-web

bun install --frozen-lockfile
bun run app
```

Para desenvolvimento e validação:

```bash
bun run typecheck
bun test
bun run build
```

O launcher e o runtime continuam usando a estrutura de compatibilidade do projeto:

- runtime: `~/.codex-chatgpt-web`;
- versões: `~/.codex-chatgpt-web/versions/`;
- configuração do runtime: `~/.codex-chatgpt-web/config.json`;
- diagnósticos: `~/.codex-chatgpt-web/diagnostics/browser-turns/`;
- configuração do Codex: `~/.codex/config.toml`.

No Windows, o equivalente normalmente fica em:

```text
%USERPROFILE%\.codex-chatgpt-web
%USERPROFILE%\.codex\config.toml
```

## Primeiro setup

A instalação do launcher e a integração com o Codex são etapas separadas.

### Etapa 1 — abrir o launcher e autenticar

1. Abra o launcher.
2. Entre na sua própria conta do ChatGPT no browser incorporado.
3. Execute o teste/smoke de browser.
4. Confirme que a sessão está autenticada antes de instalar os modelos no Codex.

A sessão do ChatGPT pertence ao perfil local do launcher e não deve ser compartilhada.

### Etapa 2 — escolher o modo

Há dois caminhos principais.

**Browser-only**

- usa os modelos Web disponíveis na conta;
- envia e lê a conversa pelo browser;
- não disponibiliza ferramentas locais do Codex ao ChatGPT.

**Full harness**

- usa os modelos Web disponíveis na conta;
- mantém a bridge Responses local;
- conecta ferramentas e filesystem do task atual por MCP;
- usa o tunnel configurado para o conector do ChatGPT.

Para uso de desenvolvimento com ferramentas, Full harness é o modo recomendado.

### Etapa 3 — instalar a rota do Codex

O launcher deve gerenciar a integração. Não é necessário editar `config.toml` manualmente em uma instalação normal.

A integração atual usa o provider nativo do Codex:

```toml
model_provider = "openai"
openai_base_url = "http://127.0.0.1:17841/v1"
```

O modelo selecionado será uma entrada `chatgpt-web/...`, por exemplo:

```toml
model = "chatgpt-web/gpt-5.6-sol"
```

Depois de instalar ou alterar a rota/modelos, reinicie o Codex uma vez.

A rota é reversível:

```bash
codex-chatgpt-web route status
codex-chatgpt-web route connect
codex-chatgpt-web route disconnect
```

### Etapa 4 — Full harness e MCP

No modo Full harness:

1. configure o tunnel/runtime key pelo launcher;
2. habilite Developer Mode no ChatGPT quando necessário;
3. configure o conector esperado pelo launcher;
4. valide que o conector está disponível;
5. execute o diagnóstico antes de iniciar trabalho crítico.

O conector usado atualmente pela configuração desta linha é **Codex Native2**.

Comandos úteis:

```bash
codex-chatgpt-web tunnel status
codex-chatgpt-web doctor
codex-chatgpt-web browser check
codex-chatgpt-web route status
```

No Windows, quando o comando não estiver no `PATH`, ele pode ser executado diretamente a partir da versão instalada em `%USERPROFILE%\.codex-chatgpt-web\versions\...`.

## Como a comunicação funciona

O fluxo esperado é:

```text
Codex
  |
  | Responses protocol
  v
127.0.0.1:17841
  |
  v
CodexNative Web runtime
  |
  +--> browser autenticado em chatgpt.com
  |      |
  |      +--> DOM: conteúdo renderizado e controles
  |      +--> Network/CDP: lifecycle e progresso do transporte
  |
  +--> MCP broker / tunnel
         |
         +--> terminal, filesystem e tools do task atual
```

O DOM não deve ser a única autoridade para decidir se um turno foi aceito ou se o transporte ainda está ativo. A implementação atual combina sinais do DOM, tráfego de rede/CDP, progresso MCP e fences de conclusão.

## Compactação de contexto

A compactação é um turno de sumarização separado.

Para compactação:

1. o Codex solicita o checkpoint;
2. o runtime envia o contexto que precisa ser resumido;
3. o ChatGPT pode reformatar ou reescrever blocos provisórios enquanto renderiza;
4. CodexNative Web mantém a projeção mais recente sem publicar esses blocos provisórios como resposta normal;
5. somente a versão final é serializada para o contrato de compactação;
6. o Codex continua a tarefa usando o checkpoint resultante.

Isso evita tratar uma reescrita normal do renderer como tentativa de alterar texto que já teria sido entregue ao cliente.

## Atualização

A regra é simples: **não misture canais**.

Se a instalação é CodexNative Web, atualize sempre a partir de:

```text
erlancarreira/codex-chatgpt-web
```

O launcher/runtime usa versões instaladas em diretórios versionados. A atualização deve preservar:

- perfil autenticado do ChatGPT;
- `config.json`;
- configuração do launcher;
- integração do Codex;
- chaves e configuração local do tunnel, conforme o mecanismo já existente.

Após uma atualização que altere runtime, bridge ou integração:

1. feche/reinicie o launcher quando solicitado;
2. confirme `doctor`;
3. confirme `route status`;
4. execute um turno curto;
5. quando a release tocar compactação, faça também um teste de compactação.

## Validação mínima pós-instalação

Uma instalação deve ser considerada saudável somente quando os itens abaixo estiverem válidos:

```bash
codex-chatgpt-web doctor
codex-chatgpt-web route status
codex-chatgpt-web browser check
```

Além disso:

- `http://127.0.0.1:17841/healthz` deve responder `status: ok`;
- um turno curto deve chegar a `turn-completed`;
- Full harness deve conseguir executar uma tool autorizada;
- uma compactação real deve concluir sem reconexão ou erro de consistência do Markdown.

## Diagnóstico

Os checkpoints por turno ficam em:

```text
~/.codex-chatgpt-web/diagnostics/browser-turns/
```

Os checkpoints permitem diferenciar problemas como:

- falha antes do envio;
- envio aceito sem surface válida;
- resposta visível, porém estagnada;
- falha real do transporte;
- rebind da página;
- compactação interrompida;
- turno concluído.

Um turno saudável normalmente termina com:

```text
send-ready
send-accepted
response-visible
turn-completed
```

## Rollback

Antes de substituir manualmente um runtime em produção, crie uma cópia da versão instalada.

Em releases normais, prefira reinstalar uma versão anterior publicada deste mesmo fork.

Evite restaurar somente arquivos isolados de uma release diferente se o manifesto, launcher ou runtime também tiver mudado.

## Desenvolvimento e manutenção

Fluxo recomendado para alterações:

```bash
git checkout main
git pull --ff-only fork main

bun install --frozen-lockfile
bun run typecheck
bun test
bun run build
```

Mudanças que afetem browser transport, streaming ou compactação também devem ter prova funcional real antes de release.

O critério para declarar uma correção como concluída não é apenas a suíte unitária: um turno real pelo runtime instalado deve completar no caminho usado pelo Codex.

## Relação com o upstream

O remote recomendado para desenvolvimento deste fork é:

```text
fork   -> git@github.com:erlancarreira/codex-chatgpt-web.git
origin -> https://github.com/miuuyy/codex-chatgpt-web.git
```

Assim:

- `fork/main` é a linha publicável do CodexNative Web;
- `origin` continua disponível para acompanhar e incorporar mudanças do upstream;
- atualizações do upstream devem ser integradas conscientemente, com testes das correções específicas deste fork.

Não faça merge automático de upstream em produção sem executar a suíte e os testes reais de browser/compaction.

## Status da instalação atual de desenvolvimento

A linha validada no momento desta documentação inclui a correção de compactação e aborted streams até o commit:

```text
43db4f3 fix chatgpt compaction rewrites and aborted streams
```

A documentação deve ser atualizada sempre que o processo de instalação, o nome público, o diretório de perfil ou o canal de release mudar.
