import jwt from 'jsonwebtoken';

const userId = process.argv[2] || 'user-123';
const secret = process.env.JWT_EXTERNAL_SECRET || 'ILIACHALLENGE';

const token = jwt.sign({ sub: userId }, secret, { expiresIn: '1h' });
process.stdout.write(token);
