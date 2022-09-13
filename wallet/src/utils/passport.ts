import { doesNotMatch } from 'assert'
import passport from 'passport'
import passportJwt from 'passport-jwt'

interface Data {
  _id: string
}

export const passportHelper = () => {
  const strategy = new passportJwt.Strategy(
    {
      jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (data: Data, callback: passportJwt.VerifiedCallback) => callback(null, data)
  )

  passport.use(strategy)
}