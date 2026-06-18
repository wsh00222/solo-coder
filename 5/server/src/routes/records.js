const express = require('express')
const router = express.Router()
const controller = require('../controllers/recordController')

router.get('/', controller.list)
router.get('/summary', controller.summary)
router.post('/', controller.create)
router.put('/:id', controller.update)
router.delete('/:id', controller.remove)

module.exports = router
