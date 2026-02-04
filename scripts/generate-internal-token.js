import jwt from 'jsonwebtoken';

const userId = process.argv[2] || 'user-123';
const secret = process.env.JWT_INTERNAL_SECRET || 'ILIACHALLENGE_INTERNAL';

const token = jwt.sign({ sub: userId, internal: true }, secret, { expiresIn: '5m' });
process.stdout.write(token);
