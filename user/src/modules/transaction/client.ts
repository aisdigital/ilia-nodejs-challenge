import { proto } from "../../connection"

const grpc = require('@grpc/grpc-js')

const GrpcClient = grpc.loadPackageDefinition(proto).TransactionService

export const transactionClient = new GrpcClient(
  'localhost:50051',
  grpc.credentials.createInsecure()
)