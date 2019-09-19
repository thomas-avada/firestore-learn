const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const serviceAccount = require("./serviceAccountKey.json");

const firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://test-node-firebase-b9cd0.firebaseio.com"
});

// Setup
const db = firebaseApp.firestore();
// const app = express.Router();

// Middleware
app.use(bodyParser.json());

// API
app.get('/posts', async (req, res) => {
    const postRef = await db.collection("posts").get();
    let posts = postRef.docs.map(post => {
        return {
            id: post.id,
            ...post.data()
        }
    });

    return res.send({
        posts
    });
});
app.post('/posts', async (req, res) => {
    const postRef = db.collection("posts");
    const {title, body} = req.body;
    const post = await postRef.add({
        title,
        body
    });

    return res.send({
        message: "Post created sucessfully",
        id: post.id
    });
});

exports.app = functions.https.onRequest(app);
