import { connectDb } from "../database/mongodb"
import { proto } from "./connection"
import { transactionRoutes } from "./modules/transaction/routes"
const grpc = require('@grpc/grpc-js')

if(process.env.NODE_ENV !== 'test') {
  connectDb()
}

const server = new grpc.Server()
server.addService(proto.TransactionService, transactionRoutes)
server.bindAsync(
  '0.0.0.0:50051',
  grpc.ServerCredentials.createInsecure(),
  () => server.start()
)