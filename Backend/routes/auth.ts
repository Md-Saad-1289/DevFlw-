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
      return res.status(401).json({ error: 'User session invalid or user not found' });
    }
    req.user = { id: user._id || user.id, name: user.name, email: user.email, role: user.role, plan: user.plan || 'free' };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
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
        plan: newUser.plan || 'free',
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
      if (!existingUser.password || existingUser.password === 'placeholder_password_not_set') {
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
            plan: updatedUser.plan || 'free',
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
        plan: newUser.plan || 'free',
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
    if (!user || !user.password || user.password === 'placeholder_password_not_set') {
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
        plan: user.plan || 'free',
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

// Get all dynamic plans (Authenticated)
router.get('/plans', authenticateToken, async (req: any, res: any) => {
  try {
    const plans = await db.plans.find({});
    res.json({ plans });
  } catch (err: any) {
    console.error('Error fetching dynamic plans:', err);
    res.status(500).json({ error: 'Server error while fetching dynamic plans' });
  }
});

// 5. Update user plan (Simulated payment-free Upgrade)
router.put('/plan', authenticateToken, async (req: any, res: any) => {
  const { plan } = req.body;
  const { id } = req.user;

  if (!plan) {
    return res.status(400).json({ error: 'Plan is required' });
  }

  try {
    const planExists = await db.plans.findOne({ key: plan.toLowerCase() });
    if (!planExists) {
      return res.status(400).json({ error: 'The requested plan is invalid or not configured on the system.' });
    }

    await db.users.updateOne({ _id: id }, { plan: plan.toLowerCase() });
    await db.users.updateOne({ id: id }, { plan: plan.toLowerCase() });

    const updatedUser = await db.users.findById(id);
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      message: `Successfully updated to ${updatedUser.plan} plan`,
      user: {
        id: updatedUser._id || updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        plan: updatedUser.plan || 'free',
        createdAt: updatedUser.createdAt
      }
    });
  } catch (err: any) {
    console.error('Error updating plan:', err);
    return res.status(500).json({ error: 'Server error while updating plan' });
  }
});

// 6. Update user profile details (Name, password)
router.put('/profile', authenticateToken, async (req: any, res: any) => {
  const { name, password } = req.body;
  const { id } = req.user;

  try {
    const user = await db.users.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates: any = {};
    if (name) {
      updates.name = name;
    }
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updates).length > 0) {
      await db.users.updateOne({ _id: id }, updates);
      await db.users.updateOne({ id: id }, updates);
    }

    const updatedUser = await db.users.findById(id);
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id || updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        plan: updatedUser.plan || 'free',
        createdAt: updatedUser.createdAt
      }
    });
  } catch (err: any) {
    console.error('Error updating profile:', err);
    return res.status(500).json({ error: 'Server error while updating profile' });
  }
});

// Update or create plans (restricted to 'developer' role for collaboration control)
router.post('/plans', authenticateToken, async (req: any, res: any) => {
  if (req.user.role !== 'developer') {
    return res.status(403).json({ error: 'Only developers can manage workspace subscription plans.' });
  }

  const { name, key, price, maxProjects, features, discount, note } = req.body;
  if (!name || !key || !price) {
    return res.status(400).json({ error: 'Name, key, and price are required to create a subscription plan.' });
  }

  try {
    const existing = await db.plans.findOne({ key: key.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'A subscription plan with this key already exists.' });
    }

    const newPlan = await db.plans.create({
      name,
      key: key.toLowerCase(),
      price,
      maxProjects: Number(maxProjects) || 2,
      features: features || [],
      discount: discount || '',
      note: note || ''
    });

    res.json({ message: 'Plan created successfully', plan: newPlan });
  } catch (err: any) {
    console.error('Error creating plan:', err);
    res.status(500).json({ error: 'Server error while creating subscription plan.' });
  }
});

router.put('/plans/:id', authenticateToken, async (req: any, res: any) => {
  if (req.user.role !== 'developer') {
    return res.status(403).json({ error: 'Only developers can manage workspace subscription plans.' });
  }

  const { id } = req.params;
  const { name, price, maxProjects, features, discount, note } = req.body;

  try {
    const existing = await db.plans.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Plan not found.' });
    }

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (price !== undefined) updates.price = price;
    if (maxProjects !== undefined) updates.maxProjects = Number(maxProjects);
    if (features !== undefined) updates.features = features;
    if (discount !== undefined) updates.discount = discount;
    if (note !== undefined) updates.note = note;

    const updated = await db.plans.findByIdAndUpdate(id, updates);
    res.json({ message: 'Plan updated successfully', plan: updated });
  } catch (err: any) {
    console.error('Error updating plan:', err);
    res.status(500).json({ error: 'Server error while updating subscription plan.' });
  }
});

export default router;
