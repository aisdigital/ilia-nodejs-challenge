export class HealthController {
  async check() {
    return {
      status: 'ok',
      service: 'user-microservice',
      timestamp: new Date().toISOString(),
    };
  }
}
