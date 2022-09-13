import mongoose from 'mongoose'
import { config } from 'dotenv'

config()

export const connectDb = (): void => {
  console.log('**********')

  mongoose.connect(String(process.env.DATABASE_URL || 'mongodb://localhost:27017'))

  mongoose.connection.on('connected', () => {
    console.log(
      'Mongoose default connection is open',
    )
  })

  mongoose.connection.on('error', (err) => {
    console.log(`Mongoose default connection has occured ${err} error`)
  })

  mongoose.connection.on('disconnected', () => {
    console.log('Mongoose default connection is disconnected')
  })

  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      console.log(
        'Mongoose default connection is disconnected due to application termination'
      )
      process.exit(0)
    })
  })
}