import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'devflw_secret_key_123';

// Middleware to verify JWT and attach user
export const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await db.users.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    req.user = { id: user._id || user.id, name: user.name, email: user.email, role: user.role };
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// 1. Register Developer
router.post('/register-developer', async (req: any, res: any) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    // Check if email already registered
    const existingUser = await db.users.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = await db.users.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'developer'
    });

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id || newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    // Return response
    return res.status(201).json({
      token,
      user: {
        id: newUser._id || newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt
      }
    });
  } catch (err: any) {
    console.error('Error in developer registration:', err);
    return res.status(500).json({ error: 'Server error during registration' });
  }
});

// 2. Register Client (Invited or Self-Registered)
router.post('/register-client', async (req: any, res: any) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const lowercaseEmail = email.toLowerCase();
    
    // Check if user already exists
    const existingUser = await db.users.findOne({ email: lowercaseEmail });
    if (existingUser) {
      // If client exists but does not have a password set (e.g. was invited/placeholder), we can update it
      if (!existingUser.password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.users.updateOne({ email: lowercaseEmail }, { name, password: hashedPassword, role: 'client' });
        
        const updatedUser = await db.users.findOne({ email: lowercaseEmail });
        const token = jwt.sign({ id: updatedUser._id || updatedUser.id, role: 'client' }, JWT_SECRET, { expiresIn: '7d' });
        
        return res.status(200).json({
          token,
          user: {
            id: updatedUser._id || updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: 'client',
            createdAt: updatedUser.createdAt
          }
        });
      }
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // Standard client self-registration
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.users.create({
      name,
      email: lowercaseEmail,
      password: hashedPassword,
      role: 'client'
    });

    const token = jwt.sign({ id: newUser._id || newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      token,
      user: {
        id: newUser._id || newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt
      }
    });
  } catch (err: any) {
    console.error('Error in client registration:', err);
    return res.status(500).json({ error: 'Server error during registration' });
  }
});

// 2.5. Register Admin
router.post('/register-admin', async (req: any, res: any) => {
  return res.status(403).json({ error: 'Admin self-registration is disabled for privacy and security reasons.' });
});

// 3. User Login (Any Role)
router.post('/login', async (req: any, res: any) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await db.users.findOne({ email: email.toLowerCase() });
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id || user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (err: any) {
    console.error('Error in user login:', err);
    return res.status(500).json({ error: 'Server error during login' });
  }
});

// 4. Get authenticated user status
router.get('/me', authenticateToken, (req: any, res: any) => {
  return res.json({ user: req.user });
});

export default router;
