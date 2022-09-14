import { proto } from "../../connection"

const grpc = require('@grpc/grpc-js')

const GrpcClient = grpc.loadPackageDefinition(proto).TransactionService

export const transactionClient = new GrpcClient(
  'localhost:3334',
  grpc.credentials.createInsecure()
)