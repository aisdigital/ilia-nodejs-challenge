# Quality Gate Documentation

## 📋 Visão Geral

O Quality Gate implementado garante alta qualidade de código, segurança e confiabilidade para o projeto ília NodeJS Challenge.

## 🎯 Critérios de Qualidade

### 📊 Métricas Obrigatórias
- **Cobertura de Testes**: ≥ 80%
- **Complexidade Ciclomática**: ≤ 10 por função
- **Linhas por Arquivo**: ≤ 300 linhas
- **Parâmetros por Função**: ≤ 4 parâmetros
- **TODO/FIXME Comments**: ≤ 5 no total

### 🔒 Critérios de Segurança
- **Audit de Dependências**: Sem vulnerabilidades críticas/altas
- **Detecção de Padrões Inseguros**: ESLint Security Plugin
- **Verificação de Dados Sensíveis**: Scan por passwords/secrets

### 🧹 Padrões de Código
- **ESLint**: Conformidade total com regras definidas
- **Prettier**: Formatação consistente
- **TypeScript**: Compilação sem erros
- **Imports**: Organizados e sem duplicações

## 🚀 Como Executar

### Localmente (Manual)
```bash
# Windows
.\scripts\quality-gate.bat

# Linux/Mac  
chmod +x scripts/quality-gate.sh
./scripts/quality-gate.sh
```

### Por Serviço Individual
```bash
cd ms-wallet
npm run quality:check

cd ms-users  
npm run quality:check
```

### GitHub Actions (Automático)
O quality gate roda automaticamente em:
- Push para `main`, `develop`, `feature/*`
- Pull Requests para `main`, `develop`

## 📊 Scripts Disponíveis

### MS-Wallet & MS-Users
```json
{
  "test": "jest",
  "test:coverage": "jest --coverage",
  "test:watch": "jest --watch", 
  "lint": "eslint src --ext .ts,.js --fix",
  "lint:check": "eslint src --ext .ts,.js",
  "format": "prettier --write \"src/**/*.{ts,js,json}\"",
  "format:check": "prettier --check \"src/**/*.{ts,js,json}\"",
  "quality:check": "npm run lint:check && npm run format:check && npm run build && npm run test:coverage",
  "precommit": "npm run quality:check"
}
```

## 🎨 Configurações

### ESLint (.eslintrc.json)
- **@typescript-eslint/recommended**: Regras TypeScript
- **eslint-plugin-security**: Detecção de vulnerabilidades
- **eslint-plugin-import**: Organização de imports
- **Complexity**: Máximo 10
- **Max-lines**: Máximo 300 linhas por arquivo

### Prettier (.prettierrc.json)
- **Semi**: true
- **SingleQuote**: true
- **PrintWidth**: 100
- **TabWidth**: 2

### Jest (jest.config.js)
- **Coverage Threshold**: 80% em todas as métricas
- **Test Environment**: Node.js
- **Timeout**: 10 segundos

## 📈 Relatórios

### Coverage Report
```
Coverage Directory: ./coverage/
- HTML Report: coverage/index.html
- LCOV Report: coverage/lcov.info
- JSON Report: coverage/coverage.json
```

### GitHub Actions Artifacts
- Coverage reports são enviados para Codecov
- Logs de qualidade disponíveis nos workflows
- Falhas são reportadas nos PRs

## 🔧 Troubleshooting

### ❌ Falha de Coverage
```bash
# Verificar cobertura atual
npm run test:coverage

# Executar testes específicos
npm test -- --testPathPattern="specific-test"
```

### ❌ Falha de Lint
```bash
# Corrigir automaticamente
npm run lint

# Ver problemas sem corrigir
npm run lint:check
```

### ❌ Falha de Formatação
```bash
# Formatar automaticamente
npm run format

# Ver problemas de formatação
npm run format:check
```

### ❌ Security Audit
```bash
# Ver detalhes das vulnerabilidades
npm audit

# Tentar correção automática
npm audit fix
```

## 🏆 Benefícios

### ✅ Qualidade Garantida
- Código consistente e limpo
- Baixa complexidade e alta testabilidade
- Documentação sempre atualizada

### ✅ Segurança
- Detecção precoce de vulnerabilidades
- Prevenção de vazamento de dados sensíveis
- Dependências sempre auditadas

### ✅ Produtividade
- Feedback rápido em desenvolvimento
- Integração contínua automatizada
- Redução de bugs em produção

### ✅ Manutenibilidade
- Código padronizado
- Testes abrangentes
- Refatoração segura

## 📋 Checklist de Qualidade

Antes de fazer commit, verifique:

- [ ] Todos os testes passam
- [ ] Coverage ≥ 80%
- [ ] Lint sem errors/warnings
- [ ] Código formatado (Prettier)
- [ ] Build TypeScript sem erros
- [ ] Security audit clean
- [ ] Documentação atualizada
- [ ] TODO/FIXME comments < 5

---

**Quality Gate implementado seguindo as melhores práticas DevOps e Clean Code!** 🎯