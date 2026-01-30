# Decisões Técnicas — Resumo e Procedimentos

Este documento registra as decisões técnicas relevantes adotadas durante a implementação, o racional por trás de cada escolha e os procedimentos operacionais que complementam o `README` e os outros materiais de descrição do desafio.

> Nota: o `README` contém as instruções de uso mais importantes para o avaliador. Este documento complementa o `README` com detalhes de implementação, motivações e passos operacionais adicionais.

## 1. Autenticação e variáveis de ambiente

- Variáveis padronizadas:
  - `JWT_PRIVATE_KEY` — chave usada para validar tokens externos.
  - `JWT_INTERNAL_PRIVATE_KEY` — chave usada para comunicação interna entre serviços.
- Por que: separar explicitamente os segredos externos e internos reduz risco de uso indevido e facilita auditoria.
- Implementação: o `wallet-service` exige `JWT_PRIVATE_KEY` em ambiente não-`test` para iniciar (ver `apps/wallet-service/src/main.ts` e `apps/wallet-service/src/modules/auth/jwt.strategy.ts`).

## 2. Testes e cobertura

- Ferramenta de testes: `Jest` com `ts-jest` como transformador TypeScript.
- Provider de coverage: `v8` (`coverageProvider: 'v8'`) para relatórios consistentes e compatíveis com engines Node modernas.
- Thresholds: cobertura global exigida (configurada em `apps/wallet-service/test/unit/jest.config.js`) — objetivo atual: 100% para o `wallet-service` nos testes unitários do pacote.
- Observação: a configuração de testes no CI utiliza `maxWorkers: 1` para garantir estabilidade em runners com recursos limitados.

## 3. Transpiler e build (produção)

- Optei por uma configuração enxuta: `ts-jest` para testes e um compilador TypeScript rápido para builds de produção (configurado via `.swcrc`). Motivação: maior velocidade, bom suporte a TypeScript, compatibilidade com decorators e configuração simples (scripts `build:*` no `package.json`).
- Execução em produção: os artefatos compilados pelo compilador ficam em `dist/` e são iniciados com `node dist/.../main.js` (scripts `start:prod:*`).

## 4. Documentação de API (Swagger)

- O Swagger foi integrado como um recurso opcional via import dinâmico nos `main.ts`. A implementação aceita a ausência do pacote em ambientes enxutos.
- Por padrão o repositório não instala `@nestjs/swagger`/`swagger-ui-express` para evitar conflitos de peer-deps com versões de runtime; caso queira habilitar localmente, instale explicitamente: `npm install @nestjs/swagger swagger-ui-express`.
- A rota da documentação é `/api` (apenas em ambiente não-`test`) quando habilitada.

## 5. Infraestrutura Docker

- `docker-compose.yml` contém os serviços mínimos necessários: Postgres para `users` e `wallet`.
- Opcionalmente foram adicionados `zookeeper`, `kafka` e `kafka-ui` para suportar cenários com mensageria (justificativa: atender ao requisito opcional do desafio).
- Nota: ao utilizar o compose localmente, confirmar as variáveis em `.env.example` antes de iniciar.

## 6. Integração Contínua (CI)

- Pipeline (`.github/workflows/ci.yml`) realiza as seguintes etapas (resumo):
  1. checkout do repositório;
  2. cache do npm (`actions/cache`) para acelerar instalações;
  3. `docker compose up -d --build` para subir a infraestrutura requerida;
  4. verificação de disponibilidade do Postgres via `pg_isready` (instala `postgresql-client` no runner);
  5. execução de `npm run lint` (falha caso ocorram erros de lint);
  6. build de produção (`build:*`);
  7. execução dos testes unitários com coverage (falha caso thresholds não sejam atingidos);
  8. `docker compose down` ao final do job para limpeza.

## 7. Linting e formatação

- Ferramentas: `ESLint` (`@typescript-eslint`) e `Prettier`.
- Regras principais: `prettier/prettier` configurada como erro; regra `@typescript-eslint/no-explicit-any` desabilitada para reduzir ruído em testes e mocks.
- Configurações incluídas: `.eslintrc.json` e `.prettierrc` no repositório.

## 8. Scripts principais adicionados

- Desenvolvimento e produção:
  - `start:dev:wallet`, `start:dev:users` — modo desenvolvimento (watch);
  - `build:wallet`, `build:users` — build de produção (compilador TypeScript rápido);
  - `start:prod:wallet`, `start:prod:users` — iniciar artefatos compilados em produção;
  - `lint`, `format` — qualidade de código.
- Testes:
  - `test:wallet`, `test:wallet:unit`, `test:users`, `test:users:unit`, etc.

## 9. Procedimento para subir a aplicação (local)

1. Copiar e ajustar variáveis de ambiente:
   - cp .env.example .env.local
   - Ajustar valores em `.env.local` conforme o ambiente (hosts, portas, chaves JWT).
2. Instalar dependências:
   - npm ci
3. Subir infraestrutura (banco e opcionalmente Kafka):
   - docker compose up -d
4. Executar serviços em desenvolvimento:
   - npm run start:dev:users
   - npm run start:dev:wallet
5. Ou executar em modo produção (gerar artefatos + iniciar):
   - npm run build:users && npm run start:prod:users
   - npm run build:wallet && npm run start:prod:wallet
6. Testes e verificação:
   - npm run test:wallet:unit --silent
   - npm run test:users:unit --silent

> Nota: os scripts de teste não requerem configuração adicional de `HISTFILE` para execução normal.

> Nota operacional: se preferir não usar Docker localmente, é necessário garantir que os bancos (Postgres) e demais infraestruturas estejam acessíveis e configuradas conforme `.env.local`.

## 10. Notas e decisões de projeto (resumo)

- A combinação `ts-jest` (testes) e um compilador TypeScript rápido (builds) simplifica a cadeia de ferramentas e melhora a velocidade dos builds e testes.
- Manter Swagger por import dinâmico permite documentação em ambientes completos sem forçar a dependência em todos os setups.
- O arquivo `.env.example` foi incluído para padronizar nomes e valores das variáveis de ambiente (evita ambiguidades entre `JWT_PRIVATE_KEY` e `JWT_SECRET` etc.).

---

Se desejar, este documento pode ser estendido com:

- exemplos de variáveis em `.env.local` por serviço;
- pequenos diagramas (ASCII/mermaid) demonstrando o fluxo gRPC entre services;
- listas de verificação (checklists) para PRs e deploys. Indique qual extensão prefere e a seção que deve ser detalhada.
