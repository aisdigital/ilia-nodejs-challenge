import express from 'express'
import cors from 'cors'
import { connectDb } from './database/mongodb'

if(process.env.NODE_ENV !== 'test') {
  connectDb()
}

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  return res.send('It works!')
})

app.listen('3001', () => console.log('Server listening on port 3001'))