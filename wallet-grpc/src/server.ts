import { proto } from "./connection"
import { transactionRoutes } from "./modules/transaction/routes"
const grpc = require('@grpc/grpc-js')

const server = new grpc.Server()
server.addService(proto.TransactionService, transactionRoutes)
server.bindAsync(
  '0.0.0.0:3334',
  grpc.ServerCredentials.createInsecure(),
  () => server.start()
)