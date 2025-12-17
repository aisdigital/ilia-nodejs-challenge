import { Router } from 'express';
import { TransactionController } from '../controllers/TransactionController';
import { AuthMiddleware } from '../../infrastructure/middleware/AuthMiddleware';

export class TransactionRoutes {
  public router: Router;

  constructor(
    private transactionController: TransactionController,
    private authMiddleware: AuthMiddleware
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    /**
     * @swagger
     * /transactions:
     *   post:
     *     summary: Criar nova transação
     *     description: Cria uma nova transação de CRÉDITO ou DÉBITO na carteira do usuário
     *     tags: [Transactions]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Transaction'
     *     responses:
     *       200:
     *         description: Transação criada com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/TransactionResponse'
     *       400:
     *         description: Dados inválidos
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       401:
     *         description: Token de acesso inválido ou ausente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Erro interno do servidor
     */
    this.router.post(
      '/transactions',
      this.authMiddleware.authenticate,
      this.transactionController.createTransaction
    );

    /**
     * @swagger
     * /transactions:
     *   get:
     *     summary: Listar transações do usuário
     *     description: Retorna todas as transações do usuário autenticado, com filtro opcional por tipo
     *     tags: [Transactions]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: type
     *         schema:
     *           type: string
     *           enum: [CREDIT, DEBIT]
     *         description: Filtrar por tipo de transação
     *     responses:
     *       200:
     *         description: Lista de transações
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/TransactionResponse'
     *       401:
     *         description: Token de acesso inválido ou ausente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Erro interno do servidor
     */
    this.router.get(
      '/transactions',
      this.authMiddleware.authenticate,
      this.transactionController.getTransactions
    );

    /**
     * @swagger
     * /balance:
     *   get:
     *     summary: Consultar saldo da carteira
     *     description: Retorna o saldo consolidado da carteira do usuário (CRÉDITOS - DÉBITOS)
     *     tags: [Balance]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Saldo atual da carteira
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Balance'
     *       401:
     *         description: Token de acesso inválido ou ausente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Erro interno do servidor
     */
    this.router.get(
      '/balance',
      this.authMiddleware.authenticate,
      this.transactionController.getBalance
    );
  }
}