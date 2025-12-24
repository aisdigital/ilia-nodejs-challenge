import { Logger } from './src/infrastructure/logging/Logger';

const logger = Logger.getInstance();

// Exemplo de teste dos logs estruturados para MS-Users
async function testLogs() {
  console.log('=== Teste de Logs Estruturados MS-Users ===\n');

  // Log de informação simples
  logger.info('Sistema de usuários iniciado');

  // Log de autenticação
  logger.auth('Usuário autenticado com sucesso', {
    correlationId: 'req-auth-123',
    userId: 'user-456',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 Chrome/120.0',
    loginTime: new Date().toISOString()
  });

  // Log de criação de usuário
  logger.user('Novo usuário criado', {
    correlationId: 'req-user-124',
    userId: 'user-789',
    userEmail: 'test@example.com',
    action: 'user_creation'
  });

  // Log de auditoria para operação crítica
  logger.audit('Dados de usuário atualizados', {
    correlationId: 'req-user-125',
    userId: 'user-456',
    action: 'update_profile',
    changedFields: ['firstName', 'email']
  });

  // Log de segurança para tentativa suspeita
  logger.security('Múltiplas tentativas de login falharam', {
    correlationId: 'req-auth-126',
    ip: '10.0.0.1',
    userEmail: 'admin@test.com',
    attemptCount: 5,
    reason: 'brute_force_attempt'
  });

  // Log de performance
  logger.performance('Consulta de usuários demorou mais que o esperado', {
    correlationId: 'req-user-127',
    duration: 2500,
    operation: 'getAllUsers',
    threshold: '2000ms'
  });

  // Log de integração com wallet service
  logger.info('Comunicação com wallet service', {
    correlationId: 'req-wallet-128',
    userId: 'user-456',
    action: 'check_wallet_balance',
    walletServiceUrl: 'http://ms-wallet:3001'
  });

  // Log de warning
  logger.warn('Usuário tentou acessar recurso sem permissão', {
    correlationId: 'req-user-129',
    userId: 'user-456',
    resource: '/admin/users',
    userRole: 'user'
  });

  // Log de erro
  try {
    throw new Error('Falha na comunicação com o serviço de wallet');
  } catch (error) {
    logger.error('Erro na integração entre serviços', error instanceof Error ? error : new Error('Unknown error'));
  }

  console.log('\n=== Teste de Logs MS-Users Concluído ===');
}

testLogs().catch(console.error);