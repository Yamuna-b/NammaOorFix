const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://Swetha:Swetha2005@cluster0.gq1ro.mongodb.net/civicconnect?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log('MongoDB connected successfully');
    // Auto-seed wards if empty
    try {
      const Ward = require('./models/Ward');
      const count = await Ward.countDocuments({ city: 'Madurai' });
      if (count === 0) {
        const possiblePaths = [
          path.join(process.cwd(), 'datasets', 'madurai_comprehensive_location_lookup.csv'),
          path.join(process.cwd(), 'madurai_comprehensive_location_lookup.csv')
        ];
        const seedPath = possiblePaths.find(p => fs.existsSync(p));
        if (seedPath) {
          const raw = fs.readFileSync(seedPath, 'utf8');
          const lines = raw.split(/\r?\n/).filter(Boolean);
          if (lines.length > 1) {
            const header = lines[0].split(',').map(h => h.trim().toLowerCase());
            const idxWard = header.findIndex(h => h.includes('ward'));
            const idxZone = header.findIndex(h => h.includes('zone'));
            const idxName = header.findIndex(h => h.includes('name'));
            const ops = [];
            for (let i = 1; i < lines.length; i++) {
              const cols = lines[i].split(',');
              const wardNumber = (cols[idxWard] || '').trim();
              const zoneNumber = (cols[idxZone] || '').trim();
              const name = idxName >= 0 ? (cols[idxName] || '').trim() : undefined;
              if (!wardNumber || !zoneNumber) continue;
              ops.push({ updateOne: { filter: { city: 'Madurai', wardNumber, zoneNumber }, update: { $set: { city: 'Madurai', wardNumber, zoneNumber, name } }, upsert: true } });
            }
            if (ops.length) {
              await Ward.bulkWrite(ops);
              console.log(`Seeded ${ops.length} ward entries from ${path.basename(seedPath)}`);
            }
          }
        } else {
          console.warn('Ward seed CSV not found; skipping auto-seed');
        }
      }
    } catch (e) {
      console.warn('Ward auto-seed failed:', e.message);
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const User = require('./models/User'); // Assuming User.js exists
const Issue = require('./models/Issue');
const Ward = require('./models/Ward');

// Protect middleware
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'You are not logged in. Please log in to get access.',
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token no longer exists.',
      });
    }
    req.user = currentUser;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid token. Please log in again.',
    });
  }
};

// Role middlewares
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ status: 'error', message: 'Admin access required' });
  }
  next();
};

const requireVerifiedOfficial = (req, res, next) => {
  if (!req.user || req.user.role !== 'official' || !req.user.isVerified) {
    return res.status(403).json({ status: 'error', message: 'Verified official access required' });
  }
  next();
};

// Auth Routes
app.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password, name } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email or username already exists',
      });
    }
    const newUser = await User.create({
      username,
      email,
      password,
      name: name || username,
    });
    newUser.password = undefined;
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET || 'fallback_secret', {
      expiresIn: process.env.JWT_EXPIRES_IN || '90d',
    });
    res.status(201).json({
      status: 'success',
      token,
      data: { user: newUser },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password',
      });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect email or password',
      });
    }
    user.password = undefined;
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret', {
      expiresIn: process.env.JWT_EXPIRES_IN || '90d',
    });
    res.status(200).json({
      status: 'success',
      token,
      data: { user },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
});

app.get('/auth/logout', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

// Issue Routes
app.get('/issues', async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate('reportedBy', 'name username avatar role isVerified department')
      .populate('upvotes', 'name username avatar')
      .populate('downvotes', 'name username avatar')
      .populate('comments.user', 'name username avatar role isVerified')
      .sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      results: issues.length,
      data: { issues },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
});

// Trending feed (users): sort by net votes and recency with pagination
app.get('/feed/trending', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, Math.min(24, parseInt(req.query.limit || '12', 10)));
    const skip = (page - 1) * limit;

    const issues = await Issue.find();
    const scored = issues.map(i => ({
      issue: i,
      score: (i.upvotes?.length || 0) - (i.downvotes?.length || 0) + Math.max(0, 10 - Math.floor((Date.now() - i.createdAt.getTime()) / (1000 * 60 * 60 * 24)))
    }))
    .sort((a, b) => b.score - a.score)
    .map(s => s.issue);
    const paged = scored.slice(skip, skip + limit);
    res.json({ status: 'success', data: { issues: paged, page, limit, total: scored.length } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Prioritized feed (officials): relevant to their department first
app.get('/feed/prioritized', protect, async (req, res) => {
  try {
    const all = await Issue.find();
    const department = req.user.department;
    const popularScore = i => (i.upvotes?.length || 0) - (i.downvotes?.length || 0);
    const severityWeight = { red: 3, yellow: 2, blue: 1 };
    const recencyDays = i => Math.max(0, 30 - Math.floor((Date.now() - i.createdAt.getTime()) / (1000 * 60 * 60 * 24)));
    const roleRelevant = i => department ? (i.assignedDepartment === department || i.category?.toLowerCase().includes(department.toLowerCase())) : false;
    const scored = all.map(i => ({
      issue: i,
      score: (roleRelevant(i) ? 10 : 0) + popularScore(i) * 2 + (severityWeight[i.severity || 'blue'] || 1) * 3 + recencyDays(i)
    }))
    .sort((a, b) => b.score - a.score)
    .map(s => s.issue);
    res.json({ status: 'success', data: { issues: scored } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

app.post('/issues', protect, async (req, res) => {
  try {
    // Enforce Madurai ward/zone restriction
    const { wardNumber, zoneNumber } = req.body;
    const ward = await Ward.findOne({ city: 'Madurai', wardNumber, zoneNumber });
    if (!ward) {
      return res.status(400).json({ status: 'error', message: 'Invalid ward/zone for Madurai' });
    }
    const issueData = {
      ...req.body,
      reportedBy: req.user.id,
    };
    const issue = await Issue.create(issueData);
    await issue.populate('reportedBy', 'name username avatar role isVerified department');
    res.status(201).json({
      status: 'success',
      data: { issue },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
});

// Backward-compatible like endpoint (maps to upvote)
app.post('/issues/:id/like', protect, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        status: 'error',
        message: 'Issue not found',
      });
    }
    const userId = req.user.id.toString();
    const hasUpvoted = issue.upvotes.map(id => id.toString()).includes(userId);
    if (hasUpvoted) {
      issue.upvotes = issue.upvotes.filter(id => id.toString() !== userId);
    } else {
      issue.upvotes.push(req.user.id);
      // Remove downvote if present
      issue.downvotes = issue.downvotes.filter(id => id.toString() !== userId);
    }
    await issue.save();
    res.status(200).json({
      status: 'success',
      data: {
        liked: !hasUpvoted,
        likesCount: issue.upvotes.length,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
});

// Voting endpoints
app.post('/issues/:id/upvote', protect, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ status: 'error', message: 'Issue not found' });
    const userId = req.user.id.toString();
    const hasUpvoted = issue.upvotes.map(id => id.toString()).includes(userId);
    if (hasUpvoted) {
      issue.upvotes = issue.upvotes.filter(id => id.toString() !== userId);
    } else {
      issue.upvotes.push(req.user.id);
      issue.downvotes = issue.downvotes.filter(id => id.toString() !== userId);
    }
    await issue.save();
    res.json({ status: 'success', data: { upvotes: issue.upvotes.length, downvotes: issue.downvotes.length } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

app.post('/issues/:id/downvote', protect, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ status: 'error', message: 'Issue not found' });
    const userId = req.user.id.toString();
    const hasDownvoted = issue.downvotes.map(id => id.toString()).includes(userId);
    if (hasDownvoted) {
      issue.downvotes = issue.downvotes.filter(id => id.toString() !== userId);
    } else {
      issue.downvotes.push(req.user.id);
      issue.upvotes = issue.upvotes.filter(id => id.toString() !== userId);
    }
    await issue.save();
    res.json({ status: 'success', data: { upvotes: issue.upvotes.length, downvotes: issue.downvotes.length } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

app.post('/issues/:id/comment', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({
        status: 'error',
        message: 'Comment text is required',
      });
    }
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        status: 'error',
        message: 'Issue not found',
      });
    }
    issue.comments.push({
      user: req.user.id,
      text,
    });
    await issue.save();
    await issue.populate('comments.user', 'name username avatar role isVerified');
    const newComment = issue.comments[issue.comments.length - 1];
    res.status(201).json({
      status: 'success',
      data: {
        comment: newComment,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
});

// Official actions
app.post('/issues/:id/acknowledge', protect, requireVerifiedOfficial, async (req, res) => {
  try {
    const { resolutionEta, assignedDepartment, assignedOfficial, severity } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ status: 'error', message: 'Issue not found' });
    issue.status = 'Acknowledged';
    issue.acknowledgedAt = new Date();
    if (resolutionEta) issue.resolutionEta = new Date(resolutionEta);
    if (assignedDepartment) issue.assignedDepartment = assignedDepartment;
    if (assignedOfficial) issue.assignedOfficial = assignedOfficial;
    if (severity) issue.severity = severity;
    await issue.save();
    res.json({ status: 'success', data: { issue } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

app.post('/issues/:id/resolve', protect, requireVerifiedOfficial, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ status: 'error', message: 'Issue not found' });
    issue.status = 'Resolved';
    issue.resolvedAt = new Date();
    await issue.save();
    res.json({ status: 'success', data: { issue } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

app.post('/issues/:id/reply', protect, requireVerifiedOfficial, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ status: 'error', message: 'Reply text is required' });
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ status: 'error', message: 'Issue not found' });
    issue.officialReplies.push({ user: req.user.id, text });
    await issue.save();
    await issue.populate('officialReplies.user', 'name username role isVerified');
    const reply = issue.officialReplies[issue.officialReplies.length - 1];
    res.status(201).json({ status: 'success', data: { reply } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

app.get('/issues/clustered', async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate('reportedBy', 'name username avatar role isVerified department')
      .sort({ createdAt: -1 });
    const clusters = [];
    const clusterRadius = 0.01; // ~1km
    issues.forEach(issue => {
      if (!issue.location || !issue.location.lat || !issue.location.lng) return;
      let addedToCluster = false;
      for (const cluster of clusters) {
        const distance = Math.sqrt(
          Math.pow(issue.location.lat - cluster.centroid.lat, 2) +
          Math.pow(issue.location.lng - cluster.centroid.lng, 2)
        );
        if (distance < clusterRadius) {
          cluster.issues.push(issue);
          addedToCluster = true;
          break;
        }
      }
      if (!addedToCluster) {
        clusters.push({
          centroid: { lat: issue.location.lat, lng: issue.location.lng },
          issues: [issue],
        });
      }
    });
    res.status(200).json({
      status: 'success',
      data: { clusters },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
});

// Admin Routes
app.get('/admin/users', protect, requireAdmin, async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    const users = await User.find(filter).select('name username email role isVerified department');
    res.json({ status: 'success', data: { users } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

app.post('/admin/users/:id/verify', protect, requireAdmin, async (req, res) => {
  try {
    const { department, role } = req.body;
    const update = { isVerified: true };
    if (department !== undefined) update.department = department;
    update.role = role || 'official';
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
    res.json({ status: 'success', data: { user } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

app.post('/admin/users/:id/role', protect, requireAdmin, async (req, res) => {
  try {
    const { role, department, isVerified } = req.body;
    const update = {};
    if (role !== undefined) update.role = role;
    if (department !== undefined) update.department = department;
    if (isVerified !== undefined) update.isVerified = isVerified;
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
    res.json({ status: 'success', data: { user } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// One-time bootstrap to create an admin if none exists
app.post('/admin/bootstrap', async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({ status: 'error', message: 'Admin already exists' });
    }
    const { username = 'admin', email = 'admin@example.com', password = 'Admin123', name = 'Admin' } = req.body || {};
    const user = await User.create({ username, email, password, name, role: 'admin', isVerified: true });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: process.env.JWT_EXPIRES_IN || '90d' });
    res.json({ status: 'success', token, data: { user } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Seed many dummy issues for demo
app.post('/admin/issues/seed', protect, requireAdmin, async (req, res) => {
  try {
    const Ward = require('./models/Ward');
    const wards = await Ward.find({ city: 'Madurai' });
    if (!wards.length) return res.status(400).json({ status: 'error', message: 'No wards to seed against' });
    const categories = ['Water Logging', 'Stray Dogs', 'Road Damage', 'No Street Lights', 'Uncemented Road', 'Infrastructure', 'Sanitation', 'Safety', 'Environment', 'Other'];
    const statuses = ['Reported', 'Acknowledged', 'In Progress', 'Resolved'];
    const randomIn = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const ops = [];
    const count = Math.max(1, Math.min(1000, parseInt(req.body?.count || 150, 10)));
    for (let i = 0; i < count; i++) {
      const w = randomIn(wards);
      const latBase = 9.9252, lngBase = 78.1198;
      const jitter = () => (Math.random() - 0.5) * 0.02;
      const payload = {
        title: `Issue #${i + 1}: ${randomIn(categories)}`,
        description: 'Auto-generated demo issue for testing the feed and UI responsiveness.',
        category: randomIn(categories),
        wardNumber: w.wardNumber,
        zoneNumber: w.zoneNumber,
        location: { lat: latBase + jitter(), lng: lngBase + jitter(), address: `Ward ${w.wardNumber}, Zone ${w.zoneNumber}, Madurai` },
        status: randomIn(statuses),
        reportedBy: req.user._id,
        upvotes: [],
        downvotes: [],
        comments: []
      };
      ops.push({ insertOne: { document: payload } });
    }
    if (ops.length) await Issue.bulkWrite(ops);
    res.json({ status: 'success', data: { inserted: ops.length } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Ward Routes
app.get('/wards', async (req, res) => {
  try {
    const wards = await Ward.find({ city: 'Madurai' }).select('wardNumber zoneNumber name');
    res.json({ status: 'success', data: { wards } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

app.post('/admin/wards/seed', protect, requireAdmin, async (req, res) => {
  try {
    const filePath = path.join(process.cwd(), 'madurai_comprehensive_location_lookup.csv');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ status: 'error', message: 'Seed CSV not found' });
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    const lines = raw.split(/\r?\n/).filter(Boolean);
    if (lines.length <= 1) {
      return res.status(400).json({ status: 'error', message: 'CSV has no data' });
    }
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const idxWard = header.findIndex(h => h.includes('ward'));
    const idxZone = header.findIndex(h => h.includes('zone'));
    const idxName = header.findIndex(h => h.includes('name'));
    const toUpsert = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      if (!cols || cols.length < 2) continue;
      const wardNumber = (cols[idxWard] || '').trim();
      const zoneNumber = (cols[idxZone] || '').trim();
      const name = idxName >= 0 ? (cols[idxName] || '').trim() : undefined;
      if (!wardNumber || !zoneNumber) continue;
      toUpsert.push({ updateOne: {
        filter: { city: 'Madurai', wardNumber, zoneNumber },
        update: { $set: { city: 'Madurai', wardNumber, zoneNumber, name } },
        upsert: true
      }});
    }
    if (toUpsert.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No valid ward rows found' });
    }
    const result = await Ward.bulkWrite(toUpsert);
    res.json({ status: 'success', data: { upserted: result.upsertedCount || 0, modified: result.modifiedCount || 0 } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Admin: Update complaint status
app.patch('/api/complaints/:id/status', protect, async (req, res) => {
  try {
    const { status, note, assignedDepartment, assignedOfficial } = req.body;
    
    // Check if user is admin or verified official
    if (req.user.role !== 'admin' && (!req.user.isVerified || req.user.role !== 'official')) {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin or verified official access required' 
      });
    }
    
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }
    
    // Update status
    if (status) issue.status = status;
    if (assignedDepartment) issue.assignedDepartment = assignedDepartment;
    if (assignedOfficial) issue.assignedOfficial = assignedOfficial;
    
    // Add timestamp for status changes
    if (status === 'Acknowledged') issue.acknowledgedAt = new Date();
    if (status === 'Resolved') issue.resolvedAt = new Date();
    
    // Add official reply if note provided
    if (note) {
      issue.officialReplies.push({
        user: req.user.id,
        text: note,
        createdAt: new Date()
      });
    }
    
    await issue.save();
    await issue.populate('assignedOfficial', 'name username department');
    
    res.json({
      success: true,
      message: 'Issue updated successfully',
      data: { issue }
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ success: false, message: error.message });
  }
});

// Get issues
app.get('/api/complaints', async (req, res) => {
  try {
    const {
      status, 
      category, 
      wardNumber, 
      page = 1, 
      limit = 12, 
      sort = 'recent' 
    } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (wardNumber) filter.wardNumber = wardNumber;
    
    let sortOptions = { createdAt: -1 };
    if (sort === 'popular') {
      sortOptions = { upvotes: -1 };
    }
    
    const issues = await Issue.find(filter)
      .populate('reportedBy', 'name username')
      .populate('assignedOfficial', 'name username department')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
    const total = await Issue.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        issues,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Add comment to issue
app.post('/api/complaints/:id/comments', protect, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Comment text is required' 
      });
    }
    
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }
    
    issue.comments.push({
      user: req.user.id,
      text: text.trim(),
      createdAt: new Date()
    });
    
    await issue.save();
    await issue.populate('comments.user', 'name username role');
    
    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { comment: issue.comments[issue.comments.length - 1] }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));