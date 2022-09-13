import express from 'express'
import cors from 'cors'
import passport from 'passport'
import { connectDb } from './database/mongodb'
import { router } from './modules/routes'
import { passportHelper } from './utils/passport'

if(process.env.NODE_ENV !== 'test') {
  connectDb()
}

passportHelper()

const app = express()
app.use(cors())
app.use(express.json())
app.use(router)
app.use(passport.initialize())

app.get('/', (req, res) => {
  return res.send('It works!')
})

app.listen('3001', () => console.log('Server listening on port 3001'))