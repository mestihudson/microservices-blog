const express = require('express')
const bodyParser = require('body-parser')
const { randomBytes } = require('crypto')
const cors = require('cors')
const axios = require('axios')

const app = express()
app.use(bodyParser.json())
app.use(cors())

const commentsByPostId = {}

app.get('/posts/:id/comments', (req, res) => {
  const { id } = req.params
  const comments = commentsByPostId[id] || []

  res.send(comments)
})

app.post('/posts/:id/comments', async (req, res) => {
  const commentId = randomBytes(4).toString('hex')
  const { content } = req.body
  const { id } = req.params

  const comments = commentsByPostId[id] || []
  comments.push({ id: commentId, content, status: 'pending' })
  commentsByPostId[id] = comments

  await axios.post('http://event-bus:4005/events', {
    type: 'CommentCreated',
    data: { postId: id, id: commentId, content, status: 'pending' }
  })

  res.status(201).send(comments)
})

app.post('/events', (req, res) => {
  console.log('Event Received: ' + req.body.type)

  res.send({})
})

app.listen(4001, () => {
  console.log('Listening on 4001')
})
