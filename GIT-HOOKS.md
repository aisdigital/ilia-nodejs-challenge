# Git Hooks Configuration

Este projeto utiliza **Husky** para automatizar verificações de qualidade de código através de Git hooks.

## 🎯 Hooks Configurados

### Pre-commit Hook
Executa automaticamente antes de cada commit:
- **ESLint**: Verifica e corrige problemas de código nos arquivos modificados
- **Prettier**: Formata automaticamente o código
- **Lint-staged**: Executa apenas nos arquivos que foram modificados (staged)

### Pre-push Hook  
Executa automaticamente antes de cada push:
- **Format Check**: Verifica se o código está formatado corretamente
- **ESLint**: Executa verificação de lint em todo o código
- **Build**: Compila os projetos TypeScript
- **Tests**: Executa todos os testes automatizados

## 🚀 Como Usar

### Instalação Inicial
```bash
# Instalar dependências (inclui husky e lint-staged)
npm install

# Instalar dependências dos microserviços
npm run install:all
```

### Fluxo de Desenvolvimento
1. **Fazer alterações no código**
2. **Adicionar arquivos ao stage**:
   ```bash
   git add .
   ```
3. **Commit** (pre-commit hook executa automaticamente):
   ```bash
   git commit -m "feat: minha nova feature"
   ```
4. **Push** (pre-push hook executa automaticamente):
   ```bash
   git push origin main
   ```

### Scripts Disponíveis

#### Verificações Manuais
```bash
# Executar apenas o lint
npm run lint

# Executar apenas os testes  
npm run test

# Executar verificação completa de qualidade
npm run quality:check

# Corrigir problemas de lint automaticamente
npm run lint:fix

# Formatar código
npm run format
```

#### Por Microserviço
```bash
# MS-Users
npm run lint:users
npm run test:users
npm run build:users

# MS-Wallet  
npm run lint:wallet
npm run test:wallet
npm run build:wallet
```

## 🔧 Configuração

### Lint-staged
Configurado no `package.json` para executar:
- ESLint + fix nos arquivos `.ts` e `.js` modificados
- Prettier nos arquivos `.json`, `.md`, `.yml`, `.yaml`

### Husky Hooks
Localizados em `.husky/`:
- `.husky/pre-commit` - Executa lint-staged
- `.husky/pre-push` - Executa verificação completa

## 🚫 Bypass dos Hooks (Uso Emergencial)

⚠️ **Não recomendado para uso regular**

```bash
# Pular pre-commit hook
git commit --no-verify -m "mensagem"

# Pular pre-push hook  
git push --no-verify
```

## ✅ Benefícios

- **Qualidade Consistente**: Código sempre formatado e sem erros de lint
- **Testes Garantidos**: Impossível fazer push com testes falhando
- **Automação**: Reduz erros humanos e economia de tempo
- **Padronização**: Mantém o mesmo padrão em toda a equipe