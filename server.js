const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/convert', (req, res) => {
    const inputFileContent = req.body.fileContent;

    if (!inputFileContent) {
        return res.status(400).json({ error: 'No file content provided.' });
    }

    const pythonProcess = spawn('python', [path.join(__dirname, 'starnet_converter.py')], {
        // cwd: __dirname, // Uncomment if needed
    });

    let pythonOutput = '';
    let pythonError = '';

    pythonProcess.stdout.on('data', (data) => {
        pythonOutput += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        pythonError += data.toString();
    });

    pythonProcess.on('close', (code) => {
        if (code === 0) {
            res.json({ output: pythonOutput });
        } else {
            console.error(`Python script exited with code ${code}`);
            console.error(pythonError);
            res.status(500).json({ error: 'Conversion failed. Please check the input file and try again.' });
        }
    });

    pythonProcess.stdin.write(inputFileContent);
    pythonProcess.stdin.end();
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});