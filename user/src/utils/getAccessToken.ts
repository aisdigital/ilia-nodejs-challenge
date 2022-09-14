import uuid4 from 'uuid4'
import jwt from 'jsonwebtoken'

export const getAccessToken = (_id?: string, withBearer = true) => {
  const { JWT_AUDIENCE, JWT_ISSUER } = process.env
  const JWT_SECRET = String(process.env.JWT_SECRET)
  const JWT_EXPIRATION = 4 * 60 * 60
  const TOKEN = jwt.sign(
    {
      _id: _id ?? uuid4(),
    },
    JWT_SECRET ?? '',
    {
      audience: JWT_AUDIENCE,
      issuer: JWT_ISSUER,
      expiresIn: JWT_EXPIRATION,
    },
  )

  if(withBearer) return `Bearer ${TOKEN}`
  return TOKEN
};