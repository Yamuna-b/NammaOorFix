const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const KMeans = require('ml-kmeans');

const categoryWeights = {
  'Water Logging': 1.5,
  'Stray Dogs': 1.2,
  'Road Damage': 1.3,
  'No Street Lights': 1.4,
  'Uncemented Road': 1.1,
};

router.post('/', async (req, res) => {
  const issue = new Issue(req.body);
  await issue.save();
  res.json(issue);
});

router.get('/', async (req, res) => {
  const issues = await Issue.find().sort({ createdAt: -1 });
  const issuesWithUrgency = issues.map(issue => ({
    ...issue._doc,
    urgencyScore: calculateUrgencyScore(issue),
  }));
  res.json(issuesWithUrgency);
});

router.get('/clustered', async (req, res) => {
  const issues = await Issue.find().sort({ createdAt: -1 });
  const issuesWithUrgency = issues.map(issue => ({
    ...issue._doc,
    urgencyScore: calculateUrgencyScore(issue),
  }));

  const data = issuesWithUrgency
    .filter(issue => issue.location && issue.location.lat && issue.location.lng)
    .map(issue => [
      issue.location.lat,
      issue.location.lng,
      Object.keys(categoryWeights).indexOf(issue.category),
    ]);

  if (data.length === 0) {
    return res.json([]);
  }

  const k = Math.min(5, data.length);
  const kmeans = KMeans(data, k, { initialization: 'kmeans++' });
  const clusters = kmeans.clusters.reduce((acc, clusterId, idx) => {
    if (!acc[clusterId]) {
      acc[clusterId] = { issues: [], centroid: kmeans.centroids[clusterId] };
    }
    acc[clusterId].issues.push(issuesWithUrgency[idx]);
    return acc;
  }, []);

  res.json(clusters);
});

router.post('/:id/like', async (req, res) => {
  const issue = await Issue.findById(req.params.id);
  issue.likes += 1;
  await issue.save();
  res.json({ ...issue._doc, urgencyScore: calculateUrgencyScore(issue) });
});

router.post('/:id/comment', async (req, res) => {
  const issue = await Issue.findById(req.params.id);
  issue.comments.push(req.body);
  await issue.save();
  res.json({ ...issue._doc, urgencyScore: calculateUrgencyScore(issue) });
});

router.post('/:id/acknowledge', async (req, res) => {
  const issue = await Issue.findById(req.params.id);
  issue.acknowledged = true;
  issue.acknowledgedAt = new Date();
  await issue.save();
  res.json({ ...issue._doc, urgencyScore: calculateUrgencyScore(issue) });
});

// Location-based filtering endpoint
router.get('/nearby', async (req, res) => {
  try {
    const { area, wardNumber, zone } = req.query;
    let query = {};
    
    if (area) {
      query['location.address'] = new RegExp(area, 'i');
    }
    if (wardNumber) {
      query['wardNumber'] = wardNumber;
    }
    if (zone) {
      query['zone'] = zone;
    }

    const issues = await Issue.find(query)
      .sort({ createdAt: -1 })
      .limit(50);
      
    res.json({ success: true, data: issues });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

function calculateUrgencyScore(issue) {
  const now = new Date();
  const ageInHours = (now - new Date(issue.createdAt)) / (1000 * 60 * 60);
  const ageScore = Math.min(ageInHours / 24, 1);
  const likeScore = issue.likes * 0.3;
  const commentScore = (issue.comments?.length || 0) * 0.5;
  const categoryScore = categoryWeights[issue.category] || 1;
  return (likeScore + commentScore + ageScore) * categoryScore;
}

module.exports = router;