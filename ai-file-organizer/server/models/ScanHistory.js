const mongoose = require('mongoose');

const FileSubSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  suggestedName: { type: String, default: '' },
  originalPath: { type: String, required: true },
  newPath: { type: String, default: '' },
  extension: { type: String, required: true, lowercase: true },
  category: { type: String, default: 'Uncategorized' },
  summary: { type: String, default: '' },
  confidence: { type: Number, min: 0, max: 100, default: 0 },
  reason: { type: String, default: '' },
  hash: { type: String, required: true },
  isDuplicate: { type: Boolean, default: false },
  duplicateStatus: { 
    type: String, 
    enum: ['Unique', 'Duplicate', 'Possibly Duplicate'], 
    default: 'Unique' 
  },
  duplicateReason: { type: String, default: '' },
  size: { type: Number, required: true },
  extractedText: { type: String, default: '' },
  approved: { type: Boolean, default: true },
  organized: { type: Boolean, default: false }
}, { _id: true });

const ScanHistorySchema = new mongoose.Schema({
  folderName: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['scanned', 'previewed', 'organized', 'undone', 'failed'], 
    default: 'scanned' 
  },
  statistics: {
    totalFiles: { type: Number, default: 0 },
    duplicateFiles: { type: Number, default: 0 },
    organizedFiles: { type: Number, default: 0 },
    totalSize: { type: Number, default: 0 },
    averageConfidence: { type: Number, default: 0 },
    categories: { type: Map, of: Number, default: {} }
  },
  files: [FileSubSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ScanHistory', ScanHistorySchema);
