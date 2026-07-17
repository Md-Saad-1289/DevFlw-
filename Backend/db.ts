import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Ensure data folder exists for local persistence
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const LOCAL_DB_PATH = path.join(DATA_DIR, 'db.json');

// Check if we should use MongoDB
let isMongoEnabled = !!process.env.MONGODB_URI;

// Local JSON DB implementation
interface LocalDatabase {
  users: any[];
  projects: any[];
  tasks: any[];
  feedbacks: any[];
  messages: any[];
  notifications: any[];
  plans?: any[];
}

const getLocalDb = (): LocalDatabase => {
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    const initialDb: LocalDatabase = {
      users: [],
      projects: [],
      tasks: [],
      feedbacks: [],
      messages: [],
      notifications: [],
      plans: []
    };
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }
  try {
    const data = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    if (!parsed.plans) {
      parsed.plans = [];
    }
    return parsed;
  } catch (err) {
    console.error('Error reading local DB, resetting:', err);
    const initialDb: LocalDatabase = {
      users: [],
      projects: [],
      tasks: [],
      feedbacks: [],
      messages: [],
      notifications: [],
      plans: []
    };
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }
};

const saveLocalDb = (db: LocalDatabase) => {
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
};

// Connect to MongoDB if available
if (isMongoEnabled) {
  mongoose.set('bufferCommands', false); // Disable command buffering to prevent hanging queries
  mongoose.connect(process.env.MONGODB_URI!, {
    serverSelectionTimeoutMS: 5000, // Fail fast if cannot connect in 5s
  })
    .then(() => console.log('Connected to MongoDB via Mongoose'))
    .catch((err) => {
      console.error('MongoDB connection error, falling back to local storage:', err);
      isMongoEnabled = false; // Gracefully fallback to local JSON database
    });
} else {
  console.log('Using Local Fallback JSON Database (data/db.json)');
}

// MongoDB schemas
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['developer', 'client', 'admin'], default: 'developer' },
  plan: { type: String, enum: ['free', 'pro'], default: 'free' },
  createdAt: { type: Date, default: Date.now }
});

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  developerId: { type: String, required: true },
  clients: { type: [String], default: [] }, // email addresses of invited clients
  liveDemoUrl: { type: String, default: '' },
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
  lifecycleStage: { type: String, enum: ['Planning', 'In Progress', 'Ready for Review', 'Client Review', 'Changes Requested', 'Approved', 'Completed', 'Archived'], default: 'Planning' },
  createdAt: { type: Date, default: Date.now }
});

const TaskSchema = new mongoose.Schema({
  projectId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'in_progress', 'in_review', 'completed'], default: 'pending' },
  dueDate: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const FeedbackSchema = new mongoose.Schema({
  projectId: { type: String, required: true },
  taskId: { type: String, default: '' },
  clientEmail: { type: String, default: '' },
  reporterEmail: { type: String, default: '' },
  text: { type: String, required: true },
  coordinateX: { type: Number, default: null }, // review mode click coordinate X (%)
  coordinateY: { type: Number, default: null }, // review mode click coordinate Y (%)
  x: { type: Number, default: null },
  y: { type: Number, default: null },
  viewportWidth: { type: Number, default: null },
  screenshotUrl: { type: String, default: '' },
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'rejected'], default: 'open' },
  pagePath: { type: String, default: '/' },
  createdAt: { type: Date, default: Date.now }
});

const MessageSchema = new mongoose.Schema({
  projectId: { type: String, required: true },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // recipient user ID
  projectId: { type: String, required: false },
  text: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const PlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  key: { type: String, required: true, unique: true },
  price: { type: String, required: true },
  beforePrice: { type: String, default: '' },
  maxProjects: { type: Number, required: true, default: 2 },
  features: { type: [String], default: [] },
  discount: { type: String, default: '' },
  note: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Models for Mongo
const MongoUser = mongoose.models.User || mongoose.model('User', UserSchema);
const MongoProject = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
const MongoTask = mongoose.models.Task || mongoose.model('Task', TaskSchema);
const MongoFeedback = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
const MongoMessage = mongoose.models.Message || mongoose.model('Message', MessageSchema);
const MongoNotification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
const MongoPlan = mongoose.models.Plan || mongoose.model('Plan', PlanSchema);

export const defaultPlans = [
  {
    name: 'Free',
    key: 'free',
    price: '$0/month',
    beforePrice: '',
    maxProjects: 2,
    features: ['Up to 2 projects', 'Standard task tracking', 'Basic feedback markers'],
    discount: '',
    note: 'Great for getting started',
    isActive: true
  },
  {
    name: 'Pro',
    key: 'pro',
    price: '$29/month',
    beforePrice: '$39/month',
    maxProjects: 15,
    features: ['Up to 15 projects', 'Unlimited tasks', 'Premium custom feedback', 'Developer chat support', 'Advanced status logs'],
    discount: '10% OFF',
    note: 'Perfect for agencies',
    isActive: true
  }
];

// Unified Database CRUD API wrapper to swap between Mongo and Local DB
export const db = {
  users: {
    async find(query: any = {}) {
      if (isMongoEnabled) return await MongoUser.find(query).lean();
      const users = getLocalDb().users;
      if (Object.keys(query).length === 0) return users;
      return users.filter(u => {
        return Object.keys(query).every(key => {
          if (query[key] && typeof query[key] === 'object' && query[key].$in) {
            return query[key].$in.includes(u[key]);
          }
          return u[key] === query[key];
        });
      });
    },
    async findOne(query: any) {
      if (isMongoEnabled) return await MongoUser.findOne(query).lean();
      const users = getLocalDb().users;
      return users.find(u => {
        return Object.keys(query).every(key => u[key] === query[key]);
      }) || null;
    },
    async findById(id: string) {
      if (isMongoEnabled) return await (MongoUser as any).findById(id).lean();
      const users = getLocalDb().users;
      return users.find(u => u._id === id || u.id === id) || null;
    },
    async create(data: any) {
      if (isMongoEnabled) {
        const user = await MongoUser.create(data);
        return user.toObject();
      }
      const dbStore = getLocalDb();
      const newUser = {
        _id: Math.random().toString(36).substring(2, 11),
        id: Math.random().toString(36).substring(2, 11),
        plan: data.plan || 'free',
        ...data,
        createdAt: new Date().toISOString()
      };
      dbStore.users.push(newUser);
      saveLocalDb(dbStore);
      return newUser;
    },
    async updateOne(query: any, update: any) {
      if (isMongoEnabled) return await MongoUser.updateOne(query, update);
      const dbStore = getLocalDb();
      const index = dbStore.users.findIndex(u => {
        return Object.keys(query).every(key => u[key] === query[key]);
      });
      if (index !== -1) {
        dbStore.users[index] = { ...dbStore.users[index], ...update };
        saveLocalDb(dbStore);
        return { modifiedCount: 1 };
      }
      return { modifiedCount: 0 };
    },
    async findByIdAndDelete(id: string) {
      if (isMongoEnabled) return await (MongoUser as any).findByIdAndDelete(id).lean();
      const dbStore = getLocalDb();
      const index = dbStore.users.findIndex(u => u._id === id || u.id === id);
      if (index !== -1) {
        const deleted = dbStore.users.splice(index, 1);
        saveLocalDb(dbStore);
        return deleted[0];
      }
      return null;
    }
  },
  projects: {
    async find(query: any = {}) {
      if (isMongoEnabled) return await MongoProject.find(query).lean();
      const projects = getLocalDb().projects;
      return projects.filter(p => {
        return Object.keys(query).every(key => {
          if (Array.isArray(p[key])) {
            return p[key].includes(query[key]);
          }
          return p[key] === query[key];
        });
      });
    },
    async findOne(query: any) {
      if (isMongoEnabled) return await MongoProject.findOne(query).lean();
      const projects = getLocalDb().projects;
      return projects.find(p => {
        return Object.keys(query).every(key => p[key] === query[key]);
      }) || null;
    },
    async findById(id: string) {
      if (isMongoEnabled) return await (MongoProject as any).findById(id).lean();
      const projects = getLocalDb().projects;
      return projects.find(p => p._id === id || p.id === id) || null;
    },
    async create(data: any) {
      if (isMongoEnabled) {
        const project = await MongoProject.create(data);
        return project.toObject();
      }
      const dbStore = getLocalDb();
      const newProject = {
        _id: Math.random().toString(36).substring(2, 11),
        id: Math.random().toString(36).substring(2, 11),
        ...data,
        clients: data.clients || [],
        status: data.status || 'active',
        lifecycleStage: data.lifecycleStage || 'Planning',
        createdAt: new Date().toISOString()
      };
      dbStore.projects.push(newProject);
      saveLocalDb(dbStore);
      return newProject;
    },
    async findByIdAndUpdate(id: string, update: any) {
      if (isMongoEnabled) return await (MongoProject as any).findByIdAndUpdate(id, update, { new: true }).lean();
      const dbStore = getLocalDb();
      const index = dbStore.projects.findIndex(p => p._id === id || p.id === id);
      if (index !== -1) {
        dbStore.projects[index] = { ...dbStore.projects[index], ...update };
        saveLocalDb(dbStore);
        return dbStore.projects[index];
      }
      return null;
    },
    async findByIdAndDelete(id: string) {
      if (isMongoEnabled) return await (MongoProject as any).findByIdAndDelete(id).lean();
      const dbStore = getLocalDb();
      const index = dbStore.projects.findIndex(p => p._id === id || p.id === id);
      if (index !== -1) {
        const deleted = dbStore.projects.splice(index, 1);
        saveLocalDb(dbStore);
        return deleted[0];
      }
      return null;
    }
  },
  tasks: {
    async find(query: any = {}) {
      if (isMongoEnabled) return await MongoTask.find(query).lean();
      const tasks = getLocalDb().tasks;
      return tasks.filter(t => {
        return Object.keys(query).every(key => t[key] === query[key]);
      });
    },
    async findById(id: string) {
      if (isMongoEnabled) return await (MongoTask as any).findById(id).lean();
      const tasks = getLocalDb().tasks;
      return tasks.find(t => t._id === id || t.id === id) || null;
    },
    async create(data: any) {
      if (isMongoEnabled) {
        const task = await MongoTask.create(data);
        return task.toObject();
      }
      const dbStore = getLocalDb();
      const newTask = {
        _id: Math.random().toString(36).substring(2, 11),
        id: Math.random().toString(36).substring(2, 11),
        ...data,
        status: data.status || 'pending',
        createdAt: new Date().toISOString()
      };
      dbStore.tasks.push(newTask);
      saveLocalDb(dbStore);
      return newTask;
    },
    async findByIdAndUpdate(id: string, update: any) {
      if (isMongoEnabled) return await (MongoTask as any).findByIdAndUpdate(id, update, { new: true }).lean();
      const dbStore = getLocalDb();
      const index = dbStore.tasks.findIndex(t => t._id === id || t.id === id);
      if (index !== -1) {
        dbStore.tasks[index] = { ...dbStore.tasks[index], ...update };
        saveLocalDb(dbStore);
        return dbStore.tasks[index];
      }
      return null;
    },
    async findByIdAndDelete(id: string) {
      if (isMongoEnabled) return await (MongoTask as any).findByIdAndDelete(id).lean();
      const dbStore = getLocalDb();
      const index = dbStore.tasks.findIndex(t => t._id === id || t.id === id);
      if (index !== -1) {
        const deleted = dbStore.tasks.splice(index, 1);
        saveLocalDb(dbStore);
        return deleted[0];
      }
      return null;
    }
  },
  feedbacks: {
    async find(query: any = {}) {
      if (isMongoEnabled) return await MongoFeedback.find(query).lean();
      const feedbacks = getLocalDb().feedbacks;
      return feedbacks.filter(f => {
        return Object.keys(query).every(key => f[key] === query[key]);
      });
    },
    async findById(id: string) {
      if (isMongoEnabled) return await (MongoFeedback as any).findById(id).lean();
      const feedbacks = getLocalDb().feedbacks;
      return feedbacks.find(f => f._id === id || f.id === id) || null;
    },
    async create(data: any) {
      if (isMongoEnabled) {
        const feedback = await MongoFeedback.create(data);
        return feedback.toObject();
      }
      const dbStore = getLocalDb();
      const newFeedback = {
        _id: Math.random().toString(36).substring(2, 11),
        id: Math.random().toString(36).substring(2, 11),
        ...data,
        status: data.status || 'open',
        createdAt: new Date().toISOString()
      };
      dbStore.feedbacks.push(newFeedback);
      saveLocalDb(dbStore);
      return newFeedback;
    },
    async findByIdAndUpdate(id: string, update: any) {
      if (isMongoEnabled) return await (MongoFeedback as any).findByIdAndUpdate(id, update, { new: true }).lean();
      const dbStore = getLocalDb();
      const index = dbStore.feedbacks.findIndex(f => f._id === id || f.id === id);
      if (index !== -1) {
        dbStore.feedbacks[index] = { ...dbStore.feedbacks[index], ...update };
        saveLocalDb(dbStore);
        return dbStore.feedbacks[index];
      }
      return null;
    },
    async findByIdAndDelete(id: string) {
      if (isMongoEnabled) return await (MongoFeedback as any).findByIdAndDelete(id).lean();
      const dbStore = getLocalDb();
      const index = dbStore.feedbacks.findIndex(f => f._id === id || f.id === id);
      if (index !== -1) {
        const deleted = dbStore.feedbacks.splice(index, 1);
        saveLocalDb(dbStore);
        return deleted[0];
      }
      return null;
    }
  },
  messages: {
    async find(query: any = {}) {
      if (isMongoEnabled) return await MongoMessage.find(query).sort({ createdAt: 1 }).lean();
      const messages = getLocalDb().messages;
      const filtered = messages.filter(m => {
        return Object.keys(query).every(key => m[key] === query[key]);
      });
      return filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    },
    async create(data: any) {
      if (isMongoEnabled) {
        const message = await MongoMessage.create(data);
        return message.toObject();
      }
      const dbStore = getLocalDb();
      const newMessage = {
        _id: Math.random().toString(36).substring(2, 11),
        id: Math.random().toString(36).substring(2, 11),
        ...data,
        createdAt: new Date().toISOString()
      };
      dbStore.messages.push(newMessage);
      saveLocalDb(dbStore);
      return newMessage;
    },
    async findByIdAndDelete(id: string) {
      if (isMongoEnabled) return await (MongoMessage as any).findByIdAndDelete(id).lean();
      const dbStore = getLocalDb();
      const index = dbStore.messages.findIndex(m => m._id === id || m.id === id);
      if (index !== -1) {
        const deleted = dbStore.messages.splice(index, 1);
        saveLocalDb(dbStore);
        return deleted[0];
      }
      return null;
    }
  },
  notifications: {
    async find(query: any = {}) {
      if (isMongoEnabled) return await MongoNotification.find(query).sort({ createdAt: -1 }).lean();
      const notifications = getLocalDb().notifications;
      const filtered = notifications.filter(n => {
        return Object.keys(query).every(key => n[key] === query[key]);
      });
      return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    async findById(id: string) {
      if (isMongoEnabled) return await (MongoNotification as any).findById(id).lean();
      const notifications = getLocalDb().notifications;
      return notifications.find(n => n._id === id || n.id === id) || null;
    },
    async findByIdAndUpdate(id: string, update: any) {
      if (isMongoEnabled) return await (MongoNotification as any).findByIdAndUpdate(id, update, { new: true }).lean();
      const dbStore = getLocalDb();
      const index = dbStore.notifications.findIndex(n => n._id === id || n.id === id);
      if (index !== -1) {
        dbStore.notifications[index] = { ...dbStore.notifications[index], ...update };
        saveLocalDb(dbStore);
        return dbStore.notifications[index];
      }
      return null;
    },
    async create(data: any) {
      if (isMongoEnabled) {
        const notification = await MongoNotification.create(data);
        return notification.toObject();
      }
      const dbStore = getLocalDb();
      const newNotification = {
        _id: Math.random().toString(36).substring(2, 11),
        id: Math.random().toString(36).substring(2, 11),
        ...data,
        read: false,
        createdAt: new Date().toISOString()
      };
      dbStore.notifications.push(newNotification);
      saveLocalDb(dbStore);
      return newNotification;
    },
    async updateMany(query: any, update: any) {
      if (isMongoEnabled) return await MongoNotification.updateMany(query, update);
      const dbStore = getLocalDb();
      let count = 0;
      dbStore.notifications.forEach((n, i) => {
        const matches = Object.keys(query).every(key => n[key] === query[key]);
        if (matches) {
          dbStore.notifications[i] = { ...n, ...update };
          count++;
        }
      });
      if (count > 0) saveLocalDb(dbStore);
      return { modifiedCount: count };
    },
    async findByIdAndDelete(id: string) {
      if (isMongoEnabled) return await (MongoNotification as any).findByIdAndDelete(id).lean();
      const dbStore = getLocalDb();
      const index = dbStore.notifications.findIndex(n => n._id === id || n.id === id);
      if (index !== -1) {
        const deleted = dbStore.notifications.splice(index, 1);
        saveLocalDb(dbStore);
        return deleted[0];
      }
      return null;
    }
  },
  plans: {
    async find(query: any = {}) {
      if (isMongoEnabled) {
        let list = await MongoPlan.find(query).lean();
        if (list.length === 0 && Object.keys(query).length === 0) {
          await MongoPlan.insertMany(defaultPlans as any);
          list = await MongoPlan.find(query).lean();
        }
        return list;
      }
      const dbStore = getLocalDb();
      if (!dbStore.plans || dbStore.plans.length === 0) {
        dbStore.plans = JSON.parse(JSON.stringify(defaultPlans));
        dbStore.plans.forEach((p: any) => {
          p._id = Math.random().toString(36).substring(2, 11);
          p.id = p._id;
          p.createdAt = new Date().toISOString();
        });
        saveLocalDb(dbStore);
      }
      const plans = dbStore.plans;
      if (Object.keys(query).length === 0) return plans;
      return plans.filter((p: any) => {
        return Object.keys(query).every(key => p[key] === query[key]);
      });
    },
    async findOne(query: any) {
      if (isMongoEnabled) {
        const exists = await MongoPlan.findOne({} as any).lean();
        if (!exists) {
          await MongoPlan.insertMany(defaultPlans as any);
        }
        return await MongoPlan.findOne(query).lean();
      }
      const dbStore = getLocalDb();
      if (!dbStore.plans || dbStore.plans.length === 0) {
        dbStore.plans = JSON.parse(JSON.stringify(defaultPlans));
        dbStore.plans.forEach((p: any) => {
          p._id = Math.random().toString(36).substring(2, 11);
          p.id = p._id;
          p.createdAt = new Date().toISOString();
        });
        saveLocalDb(dbStore);
      }
      return dbStore.plans.find((p: any) => {
        return Object.keys(query).every(key => p[key] === query[key]);
      }) || null;
    },
    async findById(id: string) {
      if (isMongoEnabled) return await (MongoPlan as any).findById(id).lean();
      const dbStore = getLocalDb();
      const plans = dbStore.plans || [];
      return plans.find((p: any) => p._id === id || p.id === id) || null;
    },
    async create(data: any) {
      if (isMongoEnabled) {
        const plan = await MongoPlan.create(data);
        return plan.toObject();
      }
      const dbStore = getLocalDb();
      if (!dbStore.plans) dbStore.plans = [];
      const newPlan = {
        _id: Math.random().toString(36).substring(2, 11),
        id: Math.random().toString(36).substring(2, 11),
        name: data.name,
        key: data.key,
        price: data.price,
        beforePrice: data.beforePrice || '',
        maxProjects: Number(data.maxProjects) || 2,
        features: data.features || [],
        discount: data.discount || '',
        note: data.note || '',
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdAt: new Date().toISOString()
      };
      dbStore.plans.push(newPlan);
      saveLocalDb(dbStore);
      return newPlan;
    },
    async findByIdAndUpdate(id: string, update: any) {
      if (isMongoEnabled) return await (MongoPlan as any).findByIdAndUpdate(id, update, { new: true }).lean();
      const dbStore = getLocalDb();
      if (!dbStore.plans) dbStore.plans = [];
      const index = dbStore.plans.findIndex((p: any) => p._id === id || p.id === id);
      if (index !== -1) {
        if (update.maxProjects !== undefined) {
          update.maxProjects = Number(update.maxProjects);
        }
        dbStore.plans[index] = { ...dbStore.plans[index], ...update };
        saveLocalDb(dbStore);
        return dbStore.plans[index];
      }
      return null;
    },
    async findByIdAndDelete(id: string) {
      if (isMongoEnabled) return await (MongoPlan as any).findByIdAndDelete(id).lean();
      const dbStore = getLocalDb();
      if (!dbStore.plans) dbStore.plans = [];
      const index = dbStore.plans.findIndex((p: any) => p._id === id || p.id === id);
      if (index !== -1) {
        const deleted = dbStore.plans.splice(index, 1);
        saveLocalDb(dbStore);
        return deleted[0];
      }
      return null;
    }
  }
};
