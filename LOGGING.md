# Sistema de Logs Estruturados

Este documento descreve o sistema de logging implementado nos microserviços ms-wallet e ms-users, preparado para integração com ferramentas de observabilidade como Datadog, New Relic, ou Elastic Stack.

## Arquitetura do Sistema de Logs

### Tecnologias Utilizadas
- **Winston**: Biblioteca principal para logging
- **winston-daily-rotate-file**: Rotação automática de arquivos de log
- **UUID**: Geração de correlation IDs únicos

### Estrutura dos Logs

#### Formato de Desenvolvimento
```
HH:mm:ss [level] message | {context}
```

#### Formato de Produção (JSON)
```json
{
  "timestamp": "2025-12-17 00:39:50.270",
  "level": "info",
  "message": "Usuário fazendo login",
  "service": "ms-wallet",
  "version": "1.0.0",
  "environment": "production",
  "correlationId": "req-123-456",
  "userId": "user-789",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0..."
}
```

## Configuração

### Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `NODE_ENV` | development | Ambiente (development/production) |
| `LOG_LEVEL` | debug (dev) / info (prod) | Nível mínimo de log |
| `ENABLE_FILE_LOGS` | false (dev) / true (prod) | Habilita logs em arquivo |

### Níveis de Log

1. **error**: Erros críticos e exceções
2. **warn**: Warnings e situações suspeitas
3. **info**: Informações gerais do sistema
4. **debug**: Detalhes técnicos (apenas em desenvolvimento)

## Funcionalidades Principais

### 1. Correlation ID
- ID único por requisição HTTP
- Propaga através de chamadas entre serviços
- Header: `X-Correlation-ID`

### 2. Middleware de Logging
- Log automático de todas as requisições/respostas
- Captura de tempo de resposta
- Detecção de requests lentos (>1000ms)
- Logs de segurança para 401/403

### 3. Categorização de Logs
- `http_request`: Requisições HTTP
- `http_response`: Respostas HTTP
- `transaction`: Operações financeiras
- `user_management`: Operações de usuário
- `authentication`: Autenticação e autorização
- `business_operation`: Operações de negócio (auditoria)
- `security`: Eventos de segurança
- `performance`: Problemas de performance

### 4. Sanitização de Dados
- Remoção automática de informações sensíveis:
  - password
  - token
  - secret
  - key
  - authorization

## Métodos de Logging Disponíveis

### Logger Principal
```typescript
import { logger } from './infrastructure/logging/Logger';

// Logs básicos
logger.info('Sistema iniciado');
logger.warn('Aviso importante');
logger.error('Erro crítico', error);
logger.debug('Informação técnica');

// Com contexto
logger.info('Usuário logado', {
  correlationId: 'req-123',
  userId: 'user-456',
  ip: '192.168.1.1'
});
```

### Métodos Especializados

#### MS-Wallet
```typescript
// Transações
logger.transaction('Nova transação', {
  correlationId: 'req-123',
  transactionId: 'tx-001',
  amount: 1000,
  type: 'CREDIT'
});

// Auditoria
logger.audit('Saque realizado', {
  userId: 'user-456',
  amount: 500,
  action: 'withdraw'
});
```

#### MS-Users
```typescript
// Usuários
logger.user('Usuário criado', {
  userId: 'user-789',
  userEmail: 'test@example.com'
});

// Autenticação
logger.auth('Login bem-sucedido', {
  userId: 'user-456',
  loginTime: new Date().toISOString()
});
```

#### Comum
```typescript
// Segurança
logger.security('Acesso negado', {
  ip: '10.0.0.1',
  reason: 'invalid_token'
});

// Performance
logger.performance('Query lenta', {
  duration: 1500,
  threshold: '1000ms'
});
```

## Middleware de Logging

### Configuração Automática
```typescript
// Request logging (primeiro middleware)
app.use(LoggingMiddleware.requestLogger());

// Error logging (último middleware)
app.use(LoggingMiddleware.errorLogger());

// Auditoria específica
router.post('/transactions', 
  LoggingMiddleware.auditLogger('create_transaction'),
  controller.createTransaction
);
```

### Funcionalidades do Middleware
- Geração automática de correlation IDs
- Log de todas as requisições com contexto
- Medição de tempo de resposta
- Captura de erros não tratados
- Headers de correlation ID nas respostas

## Rotação de Arquivos

### Configuração Automática
- **Rotação**: Diária (YYYY-MM-DD)
- **Tamanho máximo**: 20MB por arquivo
- **Retenção**: 30 dias (logs gerais), 90 dias (auditoria)

### Tipos de Arquivos
- `wallet-YYYY-MM-DD.log`: Logs gerais do ms-wallet
- `wallet-error-YYYY-MM-DD.log`: Apenas erros do ms-wallet
- `wallet-audit-YYYY-MM-DD.log`: Logs de auditoria do ms-wallet
- `users-YYYY-MM-DD.log`: Logs gerais do ms-users
- `users-error-YYYY-MM-DD.log`: Apenas erros do ms-users
- `users-audit-YYYY-MM-DD.log`: Logs de auditoria do ms-users

## Integração com Ferramentas de Observabilidade

### Datadog
```json
{
  "source": "ms-wallet",
  "service": "ms-wallet",
  "dd.trace_id": "correlation-id",
  "level": "info",
  "message": "Transaction created",
  "transaction_id": "tx-001",
  "user_id": "user-456"
}
```

### New Relic
- Logs estruturados em JSON são automaticamente parseados
- Correlation IDs permitem rastreamento distribuído
- Métricas customizadas através de atributos

### Elastic Stack
- Índices separados por serviço e data
- Dashboards por categoria de log
- Alertas baseados em padrões de erro

## Exemplos de Uso

### Rastreamento de Transação Completa
```typescript
// MS-Users: Login
logger.auth('User authenticated', {
  correlationId: 'req-123',
  userId: 'user-456'
});

// MS-Users: Chamar MS-Wallet
logger.info('Calling wallet service', {
  correlationId: 'req-123',
  userId: 'user-456',
  action: 'create_transaction'
});

// MS-Wallet: Processar transação
logger.transaction('Transaction processed', {
  correlationId: 'req-123',
  userId: 'user-456',
  transactionId: 'tx-001',
  amount: 1000
});
```

### Monitoramento de Performance
```typescript
// Detecção automática de requests lentos
logger.performance('Slow request detected', {
  correlationId: 'req-124',
  duration: 1500,
  threshold: '1000ms',
  method: 'GET',
  url: '/api/transactions'
});
```

### Auditoria de Segurança
```typescript
// Tentativas de login falharam
logger.security('Multiple failed login attempts', {
  correlationId: 'req-125',
  ip: '10.0.0.1',
  userEmail: 'admin@test.com',
  attemptCount: 5,
  reason: 'brute_force_attempt'
});
```

## Benefícios para Produção

1. **Rastreabilidade**: Correlation IDs permitem seguir requisições através de múltiplos serviços
2. **Observabilidade**: Logs estruturados facilitam análise automatizada
3. **Debugging**: Contexto rico para identificação de problemas
4. **Auditoria**: Trilha completa de operações críticas
5. **Performance**: Identificação automática de bottlenecks
6. **Segurança**: Detecção de tentativas suspeitas
7. **Integração**: Pronto para ferramentas enterprise como Datadog/New Relic

Este sistema de logs fornece uma base sólida para observabilidade em produção, permitindo monitoramento proativo e debugging eficiente dos microserviços.