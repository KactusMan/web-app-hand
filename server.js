const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Set up the file upload using Multer
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Serve uploaded images from the 'uploads' directory
app.use('/uploads', express.static('uploads'));


// Handle POST request to upload the image and return the link
// Handle POST request to upload the image and return the link
app.post('/upload', upload.single('image'), (req, res) => {
    if (req.file) {
        const imagePath = `/uploads/${req.file.filename}`;
        const imageURL = `http://localhost:${port}${imagePath}`;

        // Ensure the filename always ends with .jpg
        const fileName = req.file.filename.endsWith('.jpg') ? req.file.filename : `${req.file.filename}.jpg`;

        // Rename the uploaded file to include the .jpg extension
        fs.rename(req.file.path, path.join('uploads', fileName), (err) => {
            if (err) {
                console.error('Error renaming file:', err);
                return res.status(500).json({ message: 'Error saving the image' });
            }

            console.log('Image uploaded:', imageURL);
            res.json({ message: 'Image uploaded successfully', link: imageURL, filename: fileName });
        });
    } else {
        res.status(400).json({ message: 'No image file provided' });
    }
});



// Handle GET request to access the uploaded image
app.get('/uploads/:filename', (req, res) => {
    const { filename } = req.params;
    res.sendFile(path.join(__dirname, 'uploads', filename));
});

// ...

function sendImageToServer(dataURL) {
    fetch(serverURL + '/upload', {
            method: 'POST',
            body: JSON.stringify({ image: dataURL }),
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.link) {
                alert('Image uploaded successfully. Link: ' + data.link);
            } else {
                alert('Failed to upload the image.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// ...








app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});