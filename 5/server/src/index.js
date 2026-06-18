const express = require('express')
const cors = require('cors')
const path = require('path')
const recordsRouter = require('./routes/records')
const { seedIfNeeded } = require('./utils/seed')

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

app.use('/api/records', recordsRouter)

app.listen(PORT, () => {
  seedIfNeeded()
  console.log(`服务已启动: http://localhost:${PORT}`)
})
