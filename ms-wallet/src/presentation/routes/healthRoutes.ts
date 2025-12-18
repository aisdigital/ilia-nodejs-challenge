import { Router } from 'express';
import { HealthController } from '../controllers/HealthController';
import { DatabaseConnection } from '../../infrastructure/database/DatabaseConnection';

const router = Router();
const databaseConnection = DatabaseConnection.getInstance();
const healthController = new HealthController(databaseConnection);

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
 *     DetailedHealth:
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
 *     summary: Health check detalhado
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Status detalhado do serviço
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DetailedHealth'
 *       503:
 *         description: Serviço com problemas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DetailedHealth'
 */
router.get('/detailed', healthController.detailedHealth);

export { router as healthRoutes };