const express = require('express');
const app = express();
// const app = express.Router();

// API
app.get('/hello', (req, res) => {
    res.json({
        message: "Hello from Firebase"
    })
});

app.listen(3001);
