export const loginSchema = {
  type: 'object',
  properties: {
    password: {
      type: 'string'
    },
    email: {
      type: 'string'
    }
  }
}