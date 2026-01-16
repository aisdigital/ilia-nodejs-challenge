export class HealthController {
  async check() {
    return {
      status: 'ok',
      service: 'wallet-microservice',
      timestamp: new Date().toISOString(),
    };
  }
}
