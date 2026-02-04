## O que foi feito?

- [ ] Foundation / scaffolding
- [ ] Lint/Format
- [ ] Docker base
- [ ] Estrutura monorepo

## Como testar?

1. `cp .env.example .env`
2. `npm install`
3. `npm run docker:up`
4. `TOKEN=$(npm run -s token:external)`
5. `curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/status`

## Checklist
- [ ] Sem secrets hardcoded
- [ ] SoC preservado (sem controller falando com DB etc.)
- [ ] Lint passando
- [ ] README atualizado
