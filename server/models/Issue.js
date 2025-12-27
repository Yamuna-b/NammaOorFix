const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }, // dynamic categories
  wardNumber: { type: String, required: true },
  zoneNumber: { type: String },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: true }
  },
  streetName: { type: String },
  landmark: { type: String },
  fullAddress: { type: String },
  pincode: { type: String },
  severity: { type: String, enum: ['blue', 'yellow', 'red'], default: 'blue' },
  urgencyScore: { type: Number, default: 0 },
  images: [String],
  videos: [String],
  status: { type: String, default: 'Reported', enum: ['Reported', 'Acknowledged', 'In Progress', 'Resolved'] },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  assignedDepartment: { type: String },
  assignedOfficial: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  acknowledged: { type: Boolean, default: false },
  acknowledgedAt: { type: Date },
  resolutionEta: { type: Date },
  resolvedAt: { type: Date },
  officialReplies: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true }); // Added timestamp option

module.exports = mongoose.model('Issue', issueSchema);
