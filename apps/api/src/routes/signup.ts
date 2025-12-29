import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

router.post('/signup', async (req, res) => {  
  console.log('Received signup request:', { email: req.body.email });
  
  const { email, password } = req.body;
  if (!email || !password) {
    console.log('Signup validation failed: missing email or password');
    return res.status(400).json({ message: 'Missing email or password' });
  }

  try {
    const existing = await prisma.account.findUnique({ where: { email } });
    if (existing) {
      console.log('Signup failed: account already exists', { email });
      return res.status(409).json({ message: 'Account already exists' });
    }

    console.log('Creating new account for:', { email });
    const hashed = await bcrypt.hash(password, 10);
    const account = await prisma.account.create({
      data: { email, password: hashed },
    });

    console.log('Account created successfully:', { accountId: account.id });
    const token = jwt.sign({ accountId: account.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, accountId: account.id });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
