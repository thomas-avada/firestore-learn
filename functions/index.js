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
// const db = firebaseApp.firestore();
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
// router.get('/api/users', (ctx, next) => {
//     ctx.query = {
//         name: "dfsdfsdf"
//     };
//     next();
// },async (ctx, next) => {
//     ctx.body = ctx.query
// });
// router.post('/api/users', jsonParser, async (ctx, next) => {
//     ctx.body = {
//         name: "dkldjfasjdf"
//     }
// });

app.use(router.routes()).use(router.allowedMethods());

// app.listen(5000);

// exports.app = functions.https.onRequest(app.callback());

exports.app = functions.https.onRequest((req, res) => {
    const Busboy = require('busboy');
    if (req.method !== 'POST') {
        // Return a "method not allowed" error
        return res.status(405).end();
    }
    const busboy = new Busboy({headers: req.headers});
    const tmpdir = os.tmpdir();

    // This object will accumulate all the fields, keyed by their name
    const fields = {};

    // This object will accumulate all the uploaded files, keyed by their name.
    const uploads = {};

    // This code will process each non-file field in the form.
    busboy.on('field', (fieldname, val) => {
        // TODO(developer): Process submitted field values here
        console.log(`Processed field ${fieldname}: ${val}.`);
        fields[fieldname] = val;
    });

    const fileWrites = [];

    // This code will process each file uploaded.
    busboy.on('file', (fieldname, file, filename) => {
        // Note: os.tmpdir() points to an in-memory file system on GCF
        // Thus, any files in it must fit in the instance's memory.
        console.log(`Processed file ${filename}`);
        const filepath = path.join(tmpdir, filename);
        uploads[fieldname] = filepath;

        const writeStream = fs.createWriteStream(filepath);
        file.pipe(writeStream);

        // File was processed by Busboy; wait for it to be written to disk.
        const promise = new Promise((resolve, reject) => {
            file.on('end', () => {
                writeStream.end();
            });
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
        fileWrites.push(promise);
    });

    // Triggered once all uploaded files are processed by Busboy.
    // We still need to wait for the disk writes (saves) to complete.
    busboy.on('finish', () => {
        Promise.all(fileWrites).then(() => {
            // TODO(developer): Process saved files here
            for (const name in uploads) {
                const file = uploads[name];
                fs.unlinkSync(file);
            }
            res.send();
        });
    });

    busboy.end(req.rawBody);

    res.json(req.rawBody);
});
