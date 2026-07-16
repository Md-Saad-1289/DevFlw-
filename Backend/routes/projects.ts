import express from 'express';
import { db } from '../db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get list of projects (contextualized by user role)
router.get('/', authenticateToken, async (req: any, res: any) => {
  try {
    const { id, email, role } = req.user;

    let projects = [];
    if (role === 'developer') {
      // Return projects created by this developer
      projects = await db.projects.find({ developerId: id });
    } else {
      // Return projects where client email is in invited list
      projects = await db.projects.find({ clients: email.toLowerCase() });
    }

    return res.json({ projects });
  } catch (err: any) {
    console.error('Error fetching projects:', err);
    return res.status(500).json({ error: 'Server error while fetching projects' });
  }
});

// Create new project (Developer only)
router.post('/', authenticateToken, async (req: any, res: any) => {
  const { name, description, liveDemoUrl, clientEmail } = req.body;
  const { id, role, plan } = req.user;

  if (role !== 'developer') {
    return res.status(403).json({ error: 'Only developers can create projects' });
  }

  if (!name) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  try {
    // Count active projects of this developer
    const existingProjects = await db.projects.find({ developerId: id });
    const activeProjects = existingProjects.filter((p: any) => p.status !== 'archived');
    
    // Fetch dynamic plan limits from database
    let projectLimit = 2;
    const userPlan = plan ? await db.plans.findOne({ key: plan.toLowerCase() }) : null;
    if (userPlan) {
      projectLimit = userPlan.maxProjects;
    } else {
      projectLimit = plan === 'pro' ? 15 : 2; // fallback
    }

    if (activeProjects.length >= projectLimit) {
      return res.status(403).json({ 
        error: `You have reached the project limit for your plan (${userPlan?.name || (plan === 'pro' ? 'Pro' : 'Free')}: ${projectLimit} projects). You are currently using ${activeProjects.length}/${projectLimit} project slots. Please upgrade or archive an existing project to proceed.` 
      });
    }

    const clientsList: string[] = [];
    if (clientEmail) {
      const lowercaseEmail = clientEmail.trim().toLowerCase();
      clientsList.push(lowercaseEmail);

      // Check if client user account exists, if not create a placeholder
      const existingUser = await db.users.findOne({ email: lowercaseEmail });
      if (!existingUser) {
        await db.users.create({
          name: clientEmail.split('@')[0], // placeholder name
          email: lowercaseEmail,
          password: 'placeholder_password_not_set', // will be set when they complete registration
          role: 'client'
        });
      }
    }

    const newProject = await db.projects.create({
      name,
      description: description || '',
      developerId: id,
      clients: clientsList,
      liveDemoUrl: liveDemoUrl || '',
      status: 'active'
    });

    // Create welcoming system notification
    if (clientEmail) {
      const invitedClient = await db.users.findOne({ email: clientEmail.trim().toLowerCase() });
      if (invitedClient) {
        await db.notifications.create({
          userId: invitedClient._id || invitedClient.id,
          projectId: newProject._id || newProject.id,
          text: `You have been invited to collaborate on the project "${name}"`
        });
      }
    }

    return res.status(201).json({ project: newProject });
  } catch (err: any) {
    console.error('Error creating project:', err);
    return res.status(500).json({ error: 'Server error during project creation' });
  }
});

// Get detailed information of a specific project
router.get('/:id', authenticateToken, async (req: any, res: any) => {
  const { id } = req.params;
  const { id: userId, email, role } = req.user;

  try {
    const project = await db.projects.findById(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Authorization checks
    if (role === 'developer' && project.developerId !== userId) {
      return res.status(403).json({ error: 'Access denied to this project' });
    }

    const clients = project.clients || [];
    if (role === 'client' && !clients.includes(email.toLowerCase())) {
      return res.status(403).json({ error: 'Access denied to this project' });
    }

    // Fetch associated tasks, feedbacks, messages, and notifications
    const tasks = await db.tasks.find({ projectId: id });
    const feedbacks = await db.feedbacks.find({ projectId: id });
    const messages = await db.messages.find({ projectId: id });

    return res.json({
      project,
      tasks,
      feedbacks,
      messages
    });
  } catch (err: any) {
    console.error('Error fetching project detail:', err);
    return res.status(500).json({ error: 'Server error while fetching project details' });
  }
});

// Update project (Developer can update all; Clients can only update lifecycleStage if invited)
router.patch('/:id', authenticateToken, async (req: any, res: any) => {
  const { id } = req.params;
  const { name, description, liveDemoUrl, status, lifecycleStage } = req.body;
  const { id: userId, email, role } = req.user;

  try {
    const project = await db.projects.findById(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const isDeveloper = role === 'developer' && project.developerId === userId;
    const clientsList = project.clients || [];
    const isClient = role === 'client' && clientsList.includes(email?.toLowerCase());

    if (!isDeveloper && !isClient) {
      return res.status(403).json({ error: 'Access denied to this project' });
    }

    // Clients can only update lifecycleStage
    if (isClient && (name !== undefined || description !== undefined || liveDemoUrl !== undefined || status !== undefined)) {
      return res.status(403).json({ error: 'Only the project developer can modify project configurations' });
    }

    const updates: any = {};
    if (isDeveloper) {
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (liveDemoUrl !== undefined) updates.liveDemoUrl = liveDemoUrl;
      if (status !== undefined) updates.status = status;
    }

    let isLifecycleChanged = false;
    let oldLifecycle = project.lifecycleStage || 'Planning';
    if (lifecycleStage !== undefined && lifecycleStage !== oldLifecycle) {
      updates.lifecycleStage = lifecycleStage;
      isLifecycleChanged = true;
    }

    const updatedProject = await db.projects.findByIdAndUpdate(id, updates);

    // Notify clients on demo link update
    if (isDeveloper && liveDemoUrl && project.clients && project.clients.length > 0) {
      for (const clientEmail of project.clients) {
        const clientUser = await db.users.findOne({ email: clientEmail });
        if (clientUser) {
          await db.notifications.create({
            userId: clientUser._id || clientUser.id,
            projectId: id,
            text: `The Live Demo link for project "${project.name}" has been updated.`
          });
        }
      }
    }

    // Notify participants on lifecycle stage update
    if (isLifecycleChanged) {
      const changerName = role === 'developer' ? 'the developer' : email;
      const text = `Project "${project.name}" status updated to "${lifecycleStage}" by ${changerName}.`;
      
      // Notify developer
      if (role !== 'developer') {
        await db.notifications.create({
          userId: project.developerId,
          projectId: id,
          text: text
        });
      }

      // Notify clients
      if (project.clients && project.clients.length > 0) {
        for (const clientEmail of project.clients) {
          if (role === 'client' && clientEmail.toLowerCase() === email.toLowerCase()) {
            continue; // Skip the client who made the change
          }
          const clientUser = await db.users.findOne({ email: clientEmail });
          if (clientUser) {
            await db.notifications.create({
              userId: clientUser._id || clientUser.id,
              projectId: id,
              text: text
            });
          }
        }
      }
    }

    return res.json({ project: updatedProject });
  } catch (err: any) {
    console.error('Error updating project:', err);
    return res.status(500).json({ error: 'Server error while updating project' });
  }
});

// Invite Client to Project (Developer only)
router.post('/:id/invite', authenticateToken, async (req: any, res: any) => {
  const { id } = req.params;
  const { email: clientEmail } = req.body;
  const { id: userId, role } = req.user;

  if (role !== 'developer') {
    return res.status(403).json({ error: 'Only developers can invite clients' });
  }

  if (!clientEmail) {
    return res.status(400).json({ error: 'Client email is required' });
  }

  try {
    const project = await db.projects.findById(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.developerId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to invite to this project' });
    }

    const lowercaseEmail = clientEmail.trim().toLowerCase();
    const clients = project.clients || [];

    // Avoid double invites
    if (clients.includes(lowercaseEmail)) {
      return res.status(400).json({ error: 'Client is already part of this project' });
    }

    // Add client email to list
    const updatedClients = [...clients, lowercaseEmail];
    const updatedProject = await db.projects.findByIdAndUpdate(id, { clients: updatedClients });

    // Check if account exists, create placeholder if not
    let clientUser = await db.users.findOne({ email: lowercaseEmail });
    if (!clientUser) {
      clientUser = await db.users.create({
        name: clientEmail.split('@')[0],
        email: lowercaseEmail,
        password: 'placeholder_password_not_set',
        role: 'client'
      });
    }

    // Notify client
    await db.notifications.create({
      userId: clientUser._id || clientUser.id,
      projectId: id,
      text: `You have been added to the workspace for "${project.name}"`
    });

    return res.json({ project: updatedProject });
  } catch (err: any) {
    console.error('Error inviting client:', err);
    return res.status(500).json({ error: 'Server error while inviting client' });
  }
});

export default router;
