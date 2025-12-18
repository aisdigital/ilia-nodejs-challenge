# Log de Entrada de Requests - Request ID

## 📋 Visão Geral

Implementado sistema específico para logar **todas as requests que entram** na aplicação com **Request ID único** (Correlation ID) para rastreabilidade completa.

## 🔍 Formato do Log

### Modo Desenvolvimento (Legível)
```
02:45:39 [info] 🔄 REQUEST INCOMING: GET /health | {"correlationId":"req-health-001","requestId":"req-health-001","method":"GET","url":"/health","ip":"192.168.1.100","userAgent":"curl/7.68.0","timestamp":"2025-12-17T05:45:39.119Z","category":"request_entry"}
```

### Modo Produção (JSON Estruturado)
```json
{
  "timestamp": "2025-12-17T05:45:18.554Z",
  "level": "info", 
  "message": "🔄 REQUEST INCOMING: GET /health",
  "service": "ms-wallet",
  "version": "1.0.0",
  "environment": "production",
  "correlationId": "req-health-001",
  "requestId": "req-health-001",
  "method": "GET",
  "url": "/health",
  "ip": "192.168.1.100",
  "userAgent": "curl/7.68.0",
  "timestamp": "2025-12-17T05:45:18.554Z",
  "category": "request_entry"
}
```

## 🏷️ Campos Capturados

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| `requestId` | ID único da requisição | `req-health-001` |
| `correlationId` | Mesmo que requestId (compatibilidade) | `req-health-001` |
| `method` | Método HTTP | `GET`, `POST`, `PUT`, `DELETE` |
| `url` | URL completa com query params | `/api/transactions?type=CREDIT` |
| `ip` | IP do cliente | `192.168.1.100` |
| `userAgent` | User Agent do cliente | `Mozilla/5.0...` |
| `userId` | ID do usuário autenticado (se disponível) | `user-456` |
| `timestamp` | Timestamp ISO da request | `2025-12-17T05:45:18.554Z` |
| `contentLength` | Tamanho do conteúdo | `256` |
| `referer` | URL de origem | `https://app.com/page` |
| `category` | Categoria do log | `request_entry` |

## 🔧 Implementação

### Middleware Automático
O log é gerado automaticamente pelo `LoggingMiddleware.requestLogger()` em **todas as requests**:

```typescript
// Log específico de entrada da request com destaque
logger.info(`🔄 REQUEST INCOMING: ${req.method} ${req.originalUrl}`, {
  correlationId: req.correlationId,
  requestId: req.correlationId,
  method: req.method,
  url: req.originalUrl,
  ip: req.ip || req.connection.remoteAddress,
  userAgent: req.get('User-Agent'),
  userId: LoggingMiddleware.extractUserId(req),
  timestamp: new Date().toISOString(),
  category: 'request_entry'
});
```

### Geração do Request ID
- **Automático**: UUID v4 gerado para cada request
- **Propagação**: Request ID pode vir do header `X-Correlation-ID`
- **Response**: Request ID é retornado no header `X-Correlation-ID` da resposta

## 📊 Exemplos por Tipo de Request

### Health Check
```
🔄 REQUEST INCOMING: GET /health
requestId: req-health-001
ip: 192.168.1.100
userAgent: curl/7.68.0
```

### Transação (Autenticada)
```
🔄 REQUEST INCOMING: POST /api/transactions  
requestId: req-tx-002
userId: user-456
ip: 192.168.1.101
userAgent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
```

### Consulta com Parâmetros
```
🔄 REQUEST INCOMING: GET /api/transactions?type=CREDIT
requestId: req-query-003
userId: user-789
ip: 192.168.1.102
userAgent: PostmanRuntime/7.32.2
```

### Autenticação
```
🔄 REQUEST INCOMING: POST /api/auth
requestId: req-auth-003
ip: 192.168.1.102
userAgent: PostmanRuntime/7.32.2
```

### Operação de Usuário
```
🔄 REQUEST INCOMING: PUT /api/users/user-456
requestId: req-update-005
userId: user-456
ip: 172.16.0.10
userAgent: MyApp/1.0.0 (iOS 17.0)
```

## 🎯 Benefícios para Monitoramento

### 1. **Rastreabilidade Completa**
- Cada request tem ID único para tracking end-to-end
- Facilita debugging de problemas específicos
- Permite correlacionar logs entre microserviços

### 2. **Análise de Tráfego**
- Identificação de padrões de uso
- Detecção de bots e tráfego suspeito
- Análise de user agents e origens

### 3. **Performance Tracking**
- Início preciso de cada request
- Base para cálculo de tempo total de processamento
- Identificação de gargalos por endpoint

### 4. **Segurança**
- Log de todas as tentativas de acesso
- Rastreamento de IPs suspeitos
- Auditoria completa de requests

## 🔍 Consultas Úteis

### Datadog/New Relic Queries

**Todas as requests de entrada:**
```
service:ms-wallet category:request_entry
```

**Requests por usuário:**
```
service:ms-wallet category:request_entry userId:user-456
```

**Requests por IP:**
```
service:ms-wallet category:request_entry ip:192.168.1.100
```

**Requests por endpoint:**
```
service:ms-wallet category:request_entry url:"/api/transactions"
```

**Tracking de request específica:**
```
requestId:req-tx-002
```

### Elasticsearch Queries

**Volume de requests por minuto:**
```json
{
  "query": {
    "bool": {
      "must": [
        {"match": {"category": "request_entry"}},
        {"range": {"timestamp": {"gte": "now-1h"}}}
      ]
    }
  },
  "aggs": {
    "requests_per_minute": {
      "date_histogram": {
        "field": "timestamp",
        "interval": "1m"
      }
    }
  }
}
```

## ⚙️ Configuração

### Headers Suportados
- `X-Correlation-ID`: Request ID customizado (opcional)
- `User-Agent`: Identificação do cliente
- `Content-Length`: Tamanho do payload
- `Referer`: URL de origem

### Extração Automática
- **User ID**: Extraído do JWT Bearer token
- **IP**: Cliente real (considera proxies)
- **Timestamp**: ISO format com timezone

## 📈 Integração com Observabilidade

Este formato de log é **otimizado para**:
- ✅ **Datadog APM**: Correlation entre traces e logs  
- ✅ **New Relic**: Distributed tracing automático
- ✅ **Elastic APM**: Correlação com transactions
- ✅ **Grafana**: Dashboards de volume e performance
- ✅ **Splunk**: Análise de padrões e anomalias

O **Request ID** serve como chave universal para correlacionar todos os eventos relacionados a uma requisição específica através de todo o stack de microserviços! 🎯