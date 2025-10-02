import express from 'express';
import KnowledgeEntry from '../models/KnowledgeEntry.js';
import { requireAuth, checkPermission } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

// GET /api/kb
router.get('/', async (req, res) => {
  try {
    const entries = await KnowledgeEntry.find().sort({ lastUpdated: -1 });
    res.json(entries.map(e => ({
      id: e._id.toString(),
      tag: e.tag,
      content: e.content,
      lastUpdated: e.lastUpdated.getTime(),
      updatedBy: e.updatedBy
    })));
  } catch (error) {
    console.error('Get KB error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch knowledge base' });
  }
});

// POST /api/kb
router.post('/', checkPermission('canManageKB'), async (req, res) => {
  try {
    const { tag, content } = req.body;
    const entry = new KnowledgeEntry({
      tag,
      content,
      updatedBy: req.session.user.username
    });
    await entry.save();

    res.json({
      id: entry._id.toString(),
      tag: entry.tag,
      content: entry.content,
      lastUpdated: entry.lastUpdated.getTime(),
      updatedBy: entry.updatedBy
    });
  } catch (error) {
    console.error('Create KB entry error:', error);
    res.status(500).json({ success: false, message: 'Failed to create entry' });
  }
});

// PUT /api/kb/:id
router.put('/:id', checkPermission('canManageKB'), async (req, res) => {
  try {
    const { tag, content } = req.body;
    const entry = await KnowledgeEntry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }

    entry.tag = tag;
    entry.content = content;
    entry.updatedBy = req.session.user.username;
    await entry.save();

    res.json({
      id: entry._id.toString(),
      tag: entry.tag,
      content: entry.content,
      lastUpdated: entry.lastUpdated.getTime(),
      updatedBy: entry.updatedBy
    });
  } catch (error) {
    console.error('Update KB entry error:', error);
    res.status(500).json({ success: false, message: 'Failed to update entry' });
  }
});

// DELETE /api/kb/:id
router.delete('/:id', checkPermission('canManageKB'), async (req, res) => {
  try {
    await KnowledgeEntry.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete KB entry error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete entry' });
  }
});

export default router;
