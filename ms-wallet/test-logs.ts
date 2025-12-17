import { logger } from './src/infrastructure/logging/Logger';

// Exemplo de teste dos logs estruturados
async function testLogs() {
  console.log('=== Teste de Logs Estruturados ===\n');

  // Log de informação simples
  logger.info('Sistema iniciado');

  // Log com contexto
  logger.info('Usuário fazendo login', {
    correlationId: 'req-123-456',
    userId: 'user-789',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0...'
  });

  // Log de transação
  logger.transaction('Nova transação criada', {
    correlationId: 'req-123-457',
    userId: 'user-789',
    transactionId: 'tx-001',
    amount: 10000,
    type: 'CREDIT'
  });

  // Log de auditoria
  logger.audit('Saque realizado', {
    correlationId: 'req-123-458',
    userId: 'user-789',
    transactionId: 'tx-002',
    amount: 5000,
    action: 'withdraw'
  });

  // Log de performance
  logger.performance('Query lenta detectada', {
    correlationId: 'req-123-459',
    duration: 1500,
    query: 'SELECT * FROM transactions',
    threshold: '1000ms'
  });

  // Log de segurança
  logger.security('Tentativa de acesso negada', {
    correlationId: 'req-123-460',
    ip: '10.0.0.1',
    userAgent: 'Suspicious Bot 1.0',
    reason: 'rate_limit_exceeded'
  });

  // Log de warning
  logger.warn('Saldo baixo detectado', {
    correlationId: 'req-123-461',
    userId: 'user-789',
    currentBalance: 100,
    threshold: 1000
  });

  // Log de erro
  try {
    throw new Error('Falha na conexão com o banco de dados');
  } catch (error) {
    logger.error('Erro crítico no sistema', error instanceof Error ? error : new Error('Unknown error'));
  }

  // Log de debug
  logger.debug('Detalhes da requisição', {
    correlationId: 'req-123-462',
    headers: {
      'content-type': 'application/json',
      'authorization': '[REDACTED]'
    },
    body: {
      amount: 1000,
      type: 'CREDIT'
    }
  });

  console.log('\n=== Teste de Logs Concluído ===');
}

testLogs().catch(console.error);