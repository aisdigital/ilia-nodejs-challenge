import passport from 'passport'
import passportJwt from 'passport-jwt'

export interface Token {
  _id: string
}

export const passportHelper = () => {
  const strategy = new passportJwt.Strategy(
    {
      jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (data: Token, callback: passportJwt.VerifiedCallback) => callback(null, data)
  )

  passport.use(strategy)
}