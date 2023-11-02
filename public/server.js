document.addEventListener('DOMContentLoaded', function() {


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

    // fetched from html


    const imageInput = document.getElementById('imageInput');
    const preview = document.getElementById('preview');
    // const openCameraButton = document.getElementById('openCameraButton');
    const startWebcamButton = document.getElementById('startWebcamButton');
    startWebcamButton.addEventListener('click', () => {
        openCam();
    });
    const takePictureButton = document.getElementById('takePictureButton');
    takePictureButton.addEventListener('click', () => {
        captureImage();
    });
    const webcamVideo = document.getElementById('webcamVideo');
    const imageURL = document.getElementById('imageURL');
    const imageLink = document.getElementById('imageLink');
    const serverURL = 'http://localhost:3000'; // Replace with your server URL

    let mediaStream;


    // openCameraButton.addEventListener('click', () => {
    //     imageInput.click(); // Trigger the file input to open the camera
    // });

    imageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        const imageURL = URL.createObjectURL(file);
        preview.src = imageURL;
        preview.style.display = 'block';
    });

    startWebcamButton.addEventListener('click', () => {
        openCam(); // Function for opening the webcam
    });

    takePictureButton.addEventListener('click', () => {
        captureImage(); // Function for capturing the image and sending it to the server
    });

    document.getElementById('uploadButton').addEventListener('click', () => {
        const file = imageInput.files[0];
        const formData = new FormData();
        formData.append('image', file);

        fetch('/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                if (data.link) {
                    imageURL.href = data.link;
                    imageURL.textContent = data.link;
                    imageLink.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });

    function openCam() {
        let All_mediaDevices = navigator.mediaDevices;
        if (!All_mediaDevices || !All_mediaDevices.getUserMedia) {
            console.log("getUserMedia() not supported.");
            return;
        }
        All_mediaDevices.getUserMedia({
                audio: true,
                video: true
            })
            .then(function(vidStream) {
                mediaStream = vidStream;
                webcamVideo.srcObject = vidStream;
                webcamVideo.style.display = 'block';
                webcamVideo.play(); // Start playing the video
                takePictureButton.style.display = 'block'; // Show the "Take Picture" button
            })
            .catch(function(e) {
                console.log(e.name + ": " + e.message);
            });
    }

    // ...

    function captureImage() {
        if (mediaStream) {
            const maxWidth = 400; // Define the maximum width for the displayed image
            const maxHeight = 400; // Define the maximum height for the displayed image

            const canvas = document.createElement('canvas');
            canvas.width = webcamVideo.videoWidth;
            canvas.height = webcamVideo.videoHeight;
            const context = canvas.getContext('2d');
            context.drawImage(webcamVideo, 0, 0, canvas.width, canvas.height);

            // Convert the canvas data to a Blob
            canvas.toBlob((blob) => {
                if (blob) {
                    const formData = new FormData();
                    formData.append('image', blob);

                    // Send the image to the server as multipart/form-data
                    fetch(serverURL + '/upload', {
                            method: 'POST',
                            body: formData
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.link) {
                                // Display the captured image on the webpage
                                const capturedImage = document.createElement('img');
                                capturedImage.src = data.link;
                                capturedImage.style.display = 'block';
                                document.body.appendChild(capturedImage);
                                // Console log the image link
                                console.log('Image link:', data.link);

                                // Remove the alert and display the link underneath the image
                                const linkContainer = document.createElement('div');
                                const link = document.createElement('a');
                                link.href = data.link;
                                link.textContent = 'Image Link';
                                linkContainer.appendChild(link);
                                document.body.appendChild(linkContainer);

                                // Create a link to download the image with the appropriate extension
                                const downloadLink = document.createElement('a');
                                downloadLink.href = data.link;
                                downloadLink.download = 'captured_image.jpg'; // Manually specify the extension
                                downloadLink.textContent = 'Download Image';
                                linkContainer.appendChild(downloadLink);
                            } else {
                                alert('Failed to upload the image.');
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                        });
                }
            }, 'image/jpeg'); // Change 'image/jpeg' to the desired image format
        }
    }



    // Create a link to download the image with the appropriate extension
    const downloadLink = document.createElement('a');
    downloadLink.href = data.link;
    downloadLink.download = 'captured_image.jpeg'; // Manually specify the extension

    downloadLink.textContent = 'Download Image';
    linkContainer.appendChild(downloadLink);



    function sendImageToServer(dataURL) {
        fetch(serverURL + '/upload', {
                method: 'POST',
                body: JSON.stringify({
                    image: dataURL
                }),
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






    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });

})