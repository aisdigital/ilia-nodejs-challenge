const protoLoader = require('@grpc/proto-loader')
import path from 'path'

export const proto = protoLoader.loadSync(
  path.resolve(__dirname, 'modules', 'transaction', 'proto', 'transaction.proto'),
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  }
)