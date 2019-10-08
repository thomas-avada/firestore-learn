const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Koa = require('koa');
const Router = require('koa-router');
const render = require('koa-ejs');
const path = require('path');
const koaBody = require('koa-body');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const serviceAccount = require("./serviceAccountKey.json");
const uploadHandler = require("./handlers/upload");

/**
 * Parses a 'multipart/form-data' upload request
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
const os = require('os');
const fs = require('fs');

const firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://test-node-firebase-b9cd0.firebaseio.com"
});
const db = firebaseApp.firestore();
const app = new Koa();
const router = new Router();

render(app, {
    root: path.join(__dirname, 'view'),
    viewExt: 'html',
    cache: false,
    debug: false
});


app.use(koaBody({
    multipart: true,
    includeUnparsed: true
}));
router.get('/', async (ctx, next) => {
    await ctx.render('form')
});
router.post('/upload', async (ctx, next) => {
    ctx.body = ctx.request.files;
});
router.get('/api/users', async (ctx, next) => {
    const userRef = db.collection("users");
    let users = await userRef.get();
    users = users.docs.map(doc => {
        return {
            id: doc.id,
            ...doc.data()
        };
    });
    ctx.body =  { users };
});
router.post('/api/users', jsonParser, async (ctx, next) => {
    ctx.body = {
        name: "dkldjfasjdf"
    }
});

app.use(router.routes()).use(router.allowedMethods());

exports.app = functions.https.onRequest(app.callback());

// exports.upload = functions.https.onRequest(uploadHandler);
