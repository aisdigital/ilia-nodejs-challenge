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
     *     description: Cria uma nova transação de CRÉDITO ou DÉBITO na carteira do usuário autenticado. O ID do usuário é extraído automaticamente do token JWT. Para transações DEBIT, o sistema verifica se o usuário possui saldo suficiente.
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
     *       201:
     *         description: Transação criada com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/TransactionResponse'
     *       400:
     *         description: Dados inválidos ou saldo insuficiente
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
      this.transactionController.createTransaction.bind(this.transactionController)
    );

    /**
     * @swagger
     * /transactions:
     *   get:
     *     summary: Listar transações do usuário
     *     description: Retorna todas as transações do usuário autenticado. O ID do usuário é extraído automaticamente do token JWT. Permite filtro opcional por tipo de transação.
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
      this.transactionController.getTransactions.bind(this.transactionController)
    );

    /**
     * @swagger
     * /balance:
     *   get:
     *     summary: Consultar saldo da carteira
     *     description: Retorna o saldo consolidado da carteira do usuário (CRÉDITOS - DÉBITOS). O ID do usuário é extraído automaticamente do token JWT.
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
      this.transactionController.getBalance.bind(this.transactionController)
    );
  }
}