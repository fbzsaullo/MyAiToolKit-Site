# Relatório de stack — myaitoolkit-site

- **Gerado em:** 2026-10-06, pelo `/sdd-setup` (completo)
- **Repositório:** aplicação única (não é monorepo)

## 1. O que foi encontrado

| Stack | Papel | Pasta | Perfil usado |
| --- | --- | --- | --- |
| Node.js / Astro | principal | `.` | `stacks/node/profile.md` |

### Versões

| Item | Versão | Origem | Observação |
| --- | --- | --- | --- |
| Node | 24.13.0 | ambiente local | `.nvmrc` = 24 e `NODE_VERSION = 24` na Netlify ✅ |
| npm | 11.6.2 | ambiente local | lockfile `package-lock.json` → gerenciador npm |
| Astro | 7.3.6 | `package-lock.json` | — |
| `@astrojs/preact` | 6.0.6 | `package-lock.json` | — |
| Preact | 10.29.8 | `package-lock.json` | a integração exige Preact 10; a versão 11 do npm não é usada |

### Bibliotecas que moldam o código

- Astro em modo estático; ilhas Preact com `client:visible` (ADR-001, ADR-003)
- CSS próprio com tokens (ADR-002)
- Shiki para código, no build (ADR-005)

### Comandos confirmados

| Para quê | Comando | Evidência |
| --- | --- | --- |
| Rodar local | `npm run dev` | `package.json` |
| Build | `npm run build` | `package.json`, `netlify.toml` |
| Prévia do build | `npm run preview` | `package.json` |
| Copiar ícones da marca | `npm run copy:brand` | `package.json` (roda antes de dev e build) |
| Auditoria de dependências | `npm audit` | npm |

### Infraestrutura e CI

- Netlify (`netlify.toml`): build `npm run build`, publicação `dist`, Node 24.
- Sem CI próprio ainda; testes e orçamentos entram na T-03.

## 2. Recomendações

### R1 — Instalar a infraestrutura de testes antes das seções

- **Por quê:** sem comando de teste, nenhum `CA-XX` pode ser provado.
- **Esforço:** baixo · **Risco:** baixo
- **Como fazer:** T-03 do plano (Playwright, axe, links e orçamento de JS).

### R2 — Considerar `astro check` para tipos

- **Por quê:** o projeto usa TypeScript estrito; `astro check` valida também os componentes `.astro`.
- **Esforço:** baixo · **Risco:** baixo
- **Como fazer:** adicionar `@astrojs/check` e rodar antes dos testes, se o tempo de build permitir.

## 3. Inconsistências

- Nenhuma.

## 4. Lacunas

- Comando de testes inexistente até a T-03 (TODO no `config.yml` e no `AGENTS.md`).
- O perfil Node do kit não tem `review-checklist.md` nem `security-checklist.md`; os reviews usam o checklist universal do perfil genérico.

## 5. O que foi gerado

| Arquivo | Ação |
| --- | --- |
| `docs/sdd/config.yml` | criado |
| `docs/sdd/stack-report.md` | criado |
| `AGENTS.md` | criado |
| `CLAUDE.md` | criado (importa o `AGENTS.md`) |
| `.claude/settings.json` | criado |
| `.codex/config.toml`, `.codex/rules/myaitoolkit.rules` | criados |
