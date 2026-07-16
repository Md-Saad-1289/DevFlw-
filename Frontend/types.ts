export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'developer' | 'client' | 'admin';
  plan?: 'free' | 'pro';
}

export interface Project {
  id: string;
  _id?: string;
  name: string;
  description: string;
  developerId: string;
  clients: string[];
  liveDemoUrl: string;
  status: 'active' | 'archived';
  lifecycleStage?: 'Planning' | 'In Progress' | 'Ready for Review' | 'Client Review' | 'Changes Requested' | 'Approved' | 'Completed' | 'Archived';
  createdAt?: string;
}

export interface Task {
  id: string;
  _id?: string;
  projectId: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'in_review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string; // email of the person or role
  dueDate?: string;
  createdAt?: string;
}

export interface Feedback {
  id: string;
  _id?: string;
  projectId: string;
  taskId?: string; // optionally link to a specific task
  reporterEmail: string;
  text: string;
  // Position coordinates for contextual overlay on live demo
  x?: number;
  y?: number;
  screenshotUrl?: string;
  resolved: boolean;
  createdAt?: string;
}

export interface Message {
  id: string;
  _id?: string;
  projectId: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderRole: 'developer' | 'client' | 'admin';
  text: string;
  createdAt?: string;
}

export interface Notification {
  id: string;
  _id?: string;
  userId: string;
  projectId?: string;
  text: string;
  read: boolean;
  createdAt?: string;
}
