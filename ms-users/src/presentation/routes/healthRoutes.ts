import { Router } from 'express';
import { HealthController } from '../controllers/HealthController';
import { DatabaseConnection } from '../../infrastructure/database/DatabaseConnection';
import { WalletService } from '../../infrastructure/services/WalletService';

const router = Router();
const databaseConnection = DatabaseConnection.getInstance();
const walletService = new WalletService(
  process.env.WALLET_SERVICE_URL || 'http://localhost:3001', 
  process.env.JWT_SECRET_INTERNAL || 'ILIACHALLENGE_INTERNAL'
);
const healthController = new HealthController(databaseConnection, walletService);

/**
 * @swagger
 * components:
 *   schemas:
 *     HealthStatus:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [healthy, unhealthy]
 *         timestamp:
 *           type: string
 *           format: date-time
 *         service:
 *           type: string
 *         version:
 *           type: string
 *
 *     DetailedHealthUsers:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [healthy, unhealthy]
 *         timestamp:
 *           type: string
 *           format: date-time
 *         service:
 *           type: string
 *         version:
 *           type: string
 *         checks:
 *           type: object
 *           properties:
 *             database:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 responseTime:
 *                   type: number
 *             memory:
 *               type: object
 *               properties:
 *                 used:
 *                   type: number
 *                 total:
 *                   type: number
 *                 percentage:
 *                   type: number
 *             walletService:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 responseTime:
 *                   type: number
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check simples
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Serviço saudável
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthStatus'
 *       503:
 *         description: Serviço com problemas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthStatus'
 */
router.get('/', healthController.simpleHealth);

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     summary: Health check detalhado com integração de serviços
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Status detalhado do serviço incluindo conectividade com wallet service
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DetailedHealthUsers'
 *       503:
 *         description: Serviço com problemas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DetailedHealthUsers'
 */
router.get('/detailed', healthController.detailedHealth);

export { router as healthRoutes };