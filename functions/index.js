const functions = require('firebase-functions')
const admin = require('firebase-admin')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const serviceAccount = require('./serviceAccountKey.json')
// const updatePost = require("./updatePost");

const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://test-node-firebase-b9cd0.firebaseio.com'
})

// Setup
const db = firebaseApp.firestore()
// const app = express.Router();

// Middleware
app.use(bodyParser.json())

// API
app.get('/api/posts', async (req, res) => {
  const postRef = await db.collection('posts').get()
  const posts = postRef.docs.map(post => {
    return {
      id: post.id,
      ...post.data()
    }
  })

  return res.send({
    posts
  })
})
app.post('/api/posts', async (req, res) => {
  const postRef = db.collection('posts')
  const { title, body } = req.body
  const post = await postRef.add({
    title,
    body
  })

  return res.send({
    message: 'Post created sucessfully',
    id: post.id
  })
})

app.get('/api/reviews', async (req, res) => {
  const reviewRef = await db.collection('reviews').where('post.id', '==', '6OBx0UNEjANDTwR0zRtw').get()
  const reviews = reviewRef.docs.map(review => {
    return {
      id: review.id,
      ...review.data()
    }
  })

  return res.send({
    reviews
  })
})

app.post('/api/reviews', async (req, res) => {
  const { rate, body, postId } = req.body
  const reviewRef = db.collection('reviews')
  const postRef = db.collection('posts')
  const post = await postRef.doc(postId).get()

  const review = await reviewRef.add({
    body,
    rate,
    post: {
      id: post.id,
      ...post.data()
    }
  })

  return res.send({
    message: 'Review created sucessfully',
    id: review.id
  })
})

exports.app = functions.https.onRequest(app)

exports.updatePost = functions
  .firestore
  .document('/posts/{postId}')
  .onUpdate(async (snap, context) => {
    const batch = db.batch()
    const updatedPost = snap.after.data()

    try {
      const toDateReviews = await db.collection('reviews')
        .where('post.id', '==', snap.after.id)
        .get()

      toDateReviews.docs.forEach(async doc => {
        const postData = doc.data().post
        const data = {
          ...postData,
          title: updatedPost.title
        }
        batch.update(doc.ref, {
          post: data
        })
      })
      await batch.commit()
    } catch (e) {
      console.log(e.message)
    }
  })
