# 🚀 ILIA Node.js Challenge - Setup Inicial

## 📋 **Step 1: Setup do Projeto**

### **Estrutura Criada**
```
ilia-microservices/
├── apps/
│   ├── users-service/      # Port 3002 + gRPC 50051
│   └── wallet-service/     # Port 3001 + gRPC 50052
├── libs/shared/            # Biblioteca compartilhada
├── proto/                  # Definições gRPC
├── docker-compose.yml      # Infraestrutura local
├── .env.example           # Template environment
├── package.json           # Dependencies e scripts
├── tsconfig.json          # TypeScript config
├── nest-cli.json          # NestJS monorepo config
└── .gitignore             # Git ignore rules
```

### **Pré-requisitos**
```bash
Node.js 18+
Docker & Docker Compose
```

### **Como Testar Setup**

1. **Instalar dependências**
```bash
npm install
```

2. **Iniciar infraestrutura**
```bash
docker-compose up -d
```

3. **Verificar serviços**
```bash
docker-compose ps
```

4. **Testar build**
```bash
npm run build
```

### **Services Disponíveis**
- **PostgreSQL Users**: `localhost:5432`
- **PostgreSQL Wallet**: `localhost:5433`
- **Kafka**: `localhost:9092`
- **Kafka UI**: `http://localhost:8080`

### **Próximos Passos**
1. ✅ Setup inicial
2. 🔜 Implementar Users Service
3. 🔜 Implementar Wallet Service
4. 🔜 Comunicação gRPC
5. 🔜 Testes completos

---

**Setup inicial concluído!** 🎯
