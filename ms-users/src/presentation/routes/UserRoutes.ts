import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { AuthController } from '../controllers/AuthController';
import { AuthMiddleware } from '../../infrastructure/middleware/AuthMiddleware';

export class UserRoutes {
  public router: Router;

  constructor(
    private userController: UserController,
    private authController: AuthController,
    private authMiddleware: AuthMiddleware
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    /**
     * @swagger
     * /auth:
     *   post:
     *     summary: Autenticar usuário
     *     description: Realiza a autenticação do usuário e retorna um token JWT
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/AuthRequest'
     *     responses:
     *       200:
     *         description: Autenticação realizada com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/AuthResponse'
     *       400:
     *         description: Dados inválidos
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       401:
     *         description: Email ou senha inválidos
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Erro interno do servidor
     */
    this.router.post('/auth', this.authController.authenticate);

    /**
     * @swagger
     * /users:
     *   post:
     *     summary: Criar novo usuário
     *     description: Registra um novo usuário no sistema
     *     tags: [Users]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UserRequest'
     *     responses:
     *       200:
     *         description: Usuário criado com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UserResponse'
     *       400:
     *         description: Dados inválidos
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       409:
     *         description: Email já está em uso
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Erro interno do servidor
     */
    this.router.post('/users', this.userController.createUser);

    /**
     * @swagger
     * /users:
     *   get:
     *     summary: Listar todos os usuários
     *     description: Retorna uma lista com todos os usuários cadastrados
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de usuários
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/UserResponse'
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
      '/users',
      this.authMiddleware.authenticate,
      this.userController.getAllUsers
    );

    /**
     * @swagger
     * /users/{id}:
     *   get:
     *     summary: Buscar usuário por ID
     *     description: Retorna os dados de um usuário específico
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: ID do usuário
     *     responses:
     *       200:
     *         description: Dados do usuário
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UserResponse'
     *       401:
     *         description: Token de acesso inválido ou ausente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Usuário não encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Erro interno do servidor
     */
    this.router.get(
      '/users/:id',
      this.authMiddleware.authenticate,
      this.userController.getUserById
    );

    /**
     * @swagger
     * /users/{id}:
     *   patch:
     *     summary: Atualizar usuário
     *     description: Atualiza os dados de um usuário existente
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: ID do usuário
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UserUpdateRequest'
     *     responses:
     *       200:
     *         description: Usuário atualizado com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UserResponse'
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
     *       404:
     *         description: Usuário não encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Erro interno do servidor
     */
    this.router.patch(
      '/users/:id',
      this.authMiddleware.authenticate,
      this.userController.updateUser
    );

    /**
     * @swagger
     * /users/{id}:
     *   delete:
     *     summary: Deletar usuário
     *     description: Remove um usuário do sistema
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: ID do usuário
     *     responses:
     *       200:
     *         description: Usuário deletado com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/DeleteResponse'
     *       401:
     *         description: Token de acesso inválido ou ausente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Usuário não encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Erro interno do servidor
     */
    this.router.delete(
      '/users/:id',
      this.authMiddleware.authenticate,
      this.userController.deleteUser
    );
  }
}