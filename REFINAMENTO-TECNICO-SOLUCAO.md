# Refinamento Técnico da Solução

## 1) Microserviço 1 - Wallet (NestJS + DDD + Clean Architecture)

### Objetivo da solução
Implementar o serviço de carteira responsável por registrar transações (`CREDIT`/`DEBIT`), listar histórico e consolidar saldo com foco em segurança, separação de responsabilidades, performance de query e escalabilidade.

### Stack e padrões
- Node.js + NestJS.
- Typescript.
- DDD tático (entidades, regras e casos de uso orientados ao domínio).
- Clean Architecture (camadas bem definidas com dependência apontando para dentro).
- Banco relacional.
- JWT para autenticação externa.
- Docker e docker-compose para app + banco.

### Estrutura proposta de pastas
```txt
ms-wallet/
  src/
    modules/
      transactions/
        domain/
          entities/
          enums/
          services/
        application/
          dtos/
          use-cases/
          ports/
        infrastructure/
          persistence/
            orm/
            repositories/
          config/
        presentation/
          controllers/
          presenters/
    shared/
      auth/
        guards/
        strategies/
      config/
      common/
        exceptions/
        filters/
        interceptors/
    main.ts
  test/
  Dockerfile
  docker-compose.yml
```

### Responsabilidades por camada
- `domain`: regras de negócio puras (ex.: validação de tipo de transação, invariantes).
- `application`: orquestração dos casos de uso (`CreateTransaction`, `ListTransactions`, `GetBalance`), contratos de repositório.
- `infrastructure`: implementação concreta de acesso a banco, configuração de ambiente e adapters.
- `presentation`: camada HTTP (controllers, validação de request, serialização de response).

### Estratégia dos endpoints
- `POST /transactions`: valida payload, autentica JWT, persiste transação.
- `GET /transactions`: autentica JWT, suporta filtro por `type`.
- `GET /balance`: autentica JWT, retorna saldo consolidado por query agregada no banco (`SUM CREDIT - SUM DEBIT`).

### Segurança
- JWT obrigatório em todas as rotas.
- Segredo externo via env var `ILIACHALLENGE`.
- Sem hardcode de credenciais/chaves.
- Tratamento explícito de erros (token inválido, recurso inexistente, input inválido, falha de persistência).

### Dados, performance e consistência
- Índices para campos de consulta frequente (`user_id`, `type`, `created_at`).
- Cálculo de saldo no banco para evitar processamento desnecessário na aplicação.
- Uso criterioso de transação de banco quando houver operação composta (com `commit/rollback`).

### Qualidade
- ESLint + Prettier.
- Testes unitários de casos de uso e regras de domínio.
- README com setup local e execução via container.

---

## 2) Microserviço 2 - Users + Integração com Wallet (NestJS + DDD + Clean Architecture)

### Objetivo da solução
Implementar cadastro e autenticação de usuários com integração segura entre serviços (`users` -> `wallet`) usando canal interno com segurança distinta da externa.

### Stack e padrões
- Node.js + NestJS.
- Typescript.
- DDD + Clean Architecture (mesma linha arquitetural do wallet).
- Banco dedicado para usuários.
- JWT externo para clientes e JWT interno para service-to-service.
- Comunicação entre micros via REST interno (simples e adequado ao escopo do challenge).

### Estrutura proposta de pastas
```txt
ms-users/
  src/
    modules/
      users/
        domain/
          entities/
          services/
        application/
          dtos/
          use-cases/
          ports/
        infrastructure/
          persistence/
            orm/
            repositories/
          cryptography/
          config/
          clients/
            wallet-client/
        presentation/
          controllers/
          presenters/
      auth/
        domain/
        application/
        infrastructure/
        presentation/
    shared/
      auth/
        guards/
        strategies/
      config/
      common/
    main.ts
  test/
  Dockerfile
  docker-compose.yml
```

### Estratégia dos endpoints
- `POST /users`: criação de usuário com validações de unicidade e formato.
- `GET /users`: listagem protegida.
- `GET /users/:id`: detalhe protegido.
- `PATCH /users/:id`: atualização protegida.
- `DELETE /users/:id`: remoção protegida.
- `POST /auth`: login e emissão de `access_token`.

### Estratégia de autenticação e autorização
- JWT externo com segredo `ILIACHALLENGE`.
- Hash de senha (ex.: bcrypt/argon2) antes de persistir.
- Sanitização de resposta para nunca expor senha.

### Integração interna com Wallet
- Adapter dedicado em `infrastructure/clients/wallet-client`.
- Envio de token interno nas chamadas service-to-service.
- Segredo interno via env var `ILIACHALLENGE_INTERNAL`.
- Tratamento de timeout/retry controlado para cenários de indisponibilidade.

### Dados, segurança e robustez
- Índice único para email.
- Tratamento de conflitos (`email já cadastrado`), credenciais inválidas e não encontrados.
- Logs estruturados para falhas de integração.
- Estratégia de erro consistente entre endpoints.

### Qualidade
- ESLint + Prettier.
- Testes unitários (use-cases de users/auth).
- README com instruções completas de execução local e via Docker.

---

## 3) Frontend - React + Vite + Typescript (MVVM por Feature)

### Objetivo da solução
Construir uma aplicação web moderna para autenticação, visualização de saldo, listagem de transações e criação de crédito/débito, com UX consistente, estados de loading/erro/vazio e estrutura escalável.

### Stack e padrões
- React + Vite + Typescript.
- MVVM por feature.
- React Router.
- Material UI (biblioteca de componentes para acelerar o desenvolvimento).
- Axios (client HTTP e interceptors JWT).
- React Hook Form + Zod (validação e formulários).
- i18n (ex.: i18next).
- Vitest + Testing Library.

### Estrutura proposta de pastas (com compartilhados)
```txt
frontend/
  src/
    app/
      providers/
      router/
      layouts/
    pages/
      login/
      dashboard/
    features/
      auth/
        view/
        view-model/
        model/
      wallet-balance/
        view/
        view-model/
        model/
      transactions-list/
        view/
        view-model/
        model/
      transaction-create/
        view/
        view-model/
        model/
    shared/
      components/
        ui/
        feedback/
      hooks/
      services/
        api/
      lib/
      utils/
      constants/
      types/
      i18n/
      styles/
    main.tsx
```

### Aplicação do MVVM
- `view/`: componentes de apresentação e páginas (sem regra de negócio).
- `view-model/`: hooks (`useXxxViewModel`) com estado de tela, ações, loading e erro, orquestrando chamadas HTTP.
- `model/`: tipos de domínio de UI, mapeadores e serviços da feature.

### Fluxos principais
- Login:
  - envio de credenciais para `/auth`.
  - armazenamento seguro do token e injeção automática no `Authorization`.
- Dashboard:
  - consulta de saldo (`/balance`) com destaque visual.
  - listagem de transações (`/transactions`) com estados de loading/vazio/erro.
- Nova transação:
  - formulário com validação (`CREDIT`/`DEBIT`, valor válido).
  - atualização reativa da lista e do saldo após sucesso.

### Componentes compartilhados e reutilização
- `shared/components/ui`: botão, input, card, modal, table base.
- `shared/components/feedback`: loading, empty state, error state, toast/alert.
- `shared/services/api`: client HTTP central, interceptors, tratamento padrão de erros.
- `shared/hooks`: hooks genéricos reutilizáveis.

### Qualidade, UX e acessibilidade
- Responsivo (desktop e mobile).
- Feedbacks claros para sucesso/falha.
- Estados intermediários bem definidos.
- Acessibilidade básica (labels, foco, contraste, navegação por teclado).
- Testes de componentes críticos e fluxos de autenticação/transação.

---

## Estratégia transversal de entrega
- Monorepo com três projetos (`ms-wallet`, `ms-users`, `frontend`) ou estrutura equivalente com isolamento por serviço.
- Padronização de lint/format/test em todos os projetos.
- Variáveis de ambiente por serviço (`.env.example` versionado sem segredos).
- Documentação objetiva com instruções de execução e validação dos fluxos.
- Gitflow com branches de feature, PRs pequenos e commits descritivos.
