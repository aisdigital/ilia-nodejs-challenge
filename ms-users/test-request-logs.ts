import { Logger } from './src/infrastructure/logging/Logger';

// Simular o log de entrada de request
function simulateIncomingRequest() {
  const logger = Logger.getInstance();
  
  console.log('=== Simulação de Request Incoming - MS-Users ===\n');

  // Simular diferentes tipos de requests
  const requests = [
    {
      method: 'GET',
      url: '/health',
      correlationId: 'req-health-001',
      ip: '192.168.1.100',
      userAgent: 'curl/7.68.0'
    },
    {
      method: 'POST', 
      url: '/api/users',
      correlationId: 'req-user-002',
      ip: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      method: 'POST',
      url: '/api/auth',
      correlationId: 'req-auth-003',
      ip: '192.168.1.102', 
      userAgent: 'PostmanRuntime/7.32.2'
    },
    {
      method: 'GET',
      url: '/api/users',
      correlationId: 'req-list-004',
      ip: '10.0.0.50',
      userAgent: 'axios/1.6.0',
      userId: 'user-admin'
    },
    {
      method: 'PUT',
      url: '/api/users/user-456',
      correlationId: 'req-update-005',
      ip: '172.16.0.10',
      userAgent: 'MyApp/1.0.0 (iOS 17.0)',
      userId: 'user-456'
    }
  ];

  requests.forEach((req, index) => {
    setTimeout(() => {
      logger.info(`🔄 REQUEST INCOMING: ${req.method} ${req.url}`, {
        correlationId: req.correlationId,
        requestId: req.correlationId,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.userAgent,
        userId: req.userId,
        timestamp: new Date().toISOString(),
        category: 'request_entry'
      });
    }, index * 500); // Delay para simular requests em momentos diferentes
  });

  console.log('\n=== Aguarde os logs de entrada... ===');
}

simulateIncomingRequest();