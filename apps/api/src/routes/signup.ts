import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPrisma } from '../lib/prisma.js';

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
    const prisma = await getPrisma();

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

router.post('/login', async (req, res) => {
  console.log('Received login request:', { email: req.body.email });

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing email or password' });
  }

  try {
    const prisma = await getPrisma();

    const account = await prisma.account.findUnique({ where: { email } });
    if (!account) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, account.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('Login successful:', { accountId: account.id });
    const token = jwt.sign({ accountId: account.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, accountId: account.id });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
