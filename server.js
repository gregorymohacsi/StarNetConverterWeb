const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.post('/convert', (req, res) => {
    console.log("Request received at /convert"); // Check if the route is being hit
    res.send("Test response from /convert"); // Send a simple test response
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});