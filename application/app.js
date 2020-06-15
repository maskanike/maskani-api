require('dotenv-safe').config({
  example: process.env.CI ? '.env.ci.example' : '.env.example'
})

require('@google-cloud/trace-agent').start({
  ignoreUrls: ['/health']
})

const cors = require('cors')
const bodyParser = require('body-parser')
const express = require('express')
const helmet = require('helmet')
const passport = require('passport')
const morgan = require('morgan')

const app = express()
// Setup express server port from ENV, default: 3000
app.set('port', process.env.PORT || 3000)

// Enable only in development HTTP request logger middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
} else {
  app.set('trust proxy', true)
  app.use(morgan('combined'))
}

// for parsing json
app.use(
  bodyParser.json({
    limit: '20mb'
  })
)

app.use(cors())
app.use(passport.initialize())
app.use(helmet())
app.use(require('./routes'))

app.use('*', (req, res) => {
  res.status(404).json({ error: 'resource not found' })
})

app.listen(app.get('port'), () => {
  console.log(`maskani api listening on port ${app.get('port')}!`)
})

module.exports = app
