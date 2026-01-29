# Como subir a aplicação (passo a passo)

Este guia contém passos claros para subir a infraestrutura e os serviços localmente, bem como comandos úteis para desenvolvimento, testes e produção.

> Observação: existe um `.env.example` no repositório com variáveis necessárias. Faça `cp .env.example .env.local` e ajuste conforme seu ambiente.

## Pré-requisitos
- Node.js LTS (recomendado 18+)
- Docker e Docker Compose (`docker compose`)
- npm (para instalar dependências)

## 1) Instalar dependências

No root do monorepo:

```bash
npm ci
```

Isto instalará dependências para todo o monorepo.

## 2) Preparar environment

```bash
cp .env.example .env.local
# Editar .env.local se necessário (ports, senhas, etc.)
```

Variáveis importantes:
- `JWT_PRIVATE_KEY` — token externo (recomendado `ILIACHALLENGE`)
- `JWT_INTERNAL_PRIVATE_KEY` — token entre serviços (recomendado `ILIACHALLENGE_INTERNAL`)
- `PORT` (cada serviço pode ter sua própria var): Wallet `3001`, Users `3002`
- `GRPC_URL` / `GRPC_PORT` — URLs/ports para gRPC se aplicável

## 3) Subir infra com Docker Compose (local)

```bash
docker compose up -d --build
```

- O compose inclui Postgres para `users` e `wallet`, e opcionalmente Kafka/Zookeeper/Kafka-UI.
- Se precisar verificar se o Postgres wallet subiu: `pg_isready -h localhost -p 5433 -U postgres`.

## 4) Rodar em modo dev (hot reload)

Em terminais separados:

```bash
# Users
npm run start:dev:users

# Wallet
npm run start:dev:wallet
```

## 5) Rodar testes localmente

Unitários (wallet):

```bash
npm run test:wallet:unit
```

Unitários (users):

```bash
npm run test:users:unit
```

Testes com coverage (wallet):

```bash
npm run test:wallet:cov
```

CI rodará lint, build (produção) e os testes com coverage; o job falhará se os thresholds não forem atingidos.

## 6) Build para produção

```bash
npm run build:wallet
npm run build:users
```

A saída ficará em `dist/apps/<service>`.

## 7) Rodar em produção

```bash
# depois de build
node dist/apps/wallet-service/main.js
node dist/apps/users-service/main.js
```

ou com Docker (construa imagens manualmente conforme README-COMPLETO).

## 8) Swagger (OpenAPI)
- Se `@nestjs/swagger` estiver instalado, acessar `http://localhost:3001/api` (wallet) e `http://localhost:3002/api` (users).
- Implementação no `main.ts` usa import dinâmico e não vai quebrar caso o pacote não esteja presente.

## 9) Observações e troubleshooting
- Se notar erros de portas em uso: `lsof -i :3001` / `kill -9 <PID>`.
- Caso o CI falhe por DB não pronto, verifique `docker compose logs` e `pg_isready`

---

Se quiser, eu posso gerar scripts opcionais para: executar migrations automaticamente, seeds iniciais e um script de `wait-for-db` mais robusto (por exemplo usar `wait-for-it` ou um pequeno Node script que tenta conectar ao DB).