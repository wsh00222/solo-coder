const express = require('express');
const router = express.Router();
const {
  getAllTags,
  deleteTag
} = require('../controllers/tagsController');

router.get('/', getAllTags);
router.delete('/:id', deleteTag);

module.exports = router;
