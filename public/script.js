document.addEventListener('DOMContentLoaded', () => {
    const uploadButton = document.getElementById('uploadButton');
    const fileInput = document.getElementById('fileInput');

    if (uploadButton && fileInput) {
        uploadButton.addEventListener('click', () => {
            const file = fileInput.files[0];

            if (!file) {
                alert("Please select a file.");
                return;
            }

            const formData = new FormData();
            formData.append('file', file);

            // Send the file to the Node.js backend
            fetch('/convert', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error processing file');
                }
                return response.blob();
            })
            .then(blob => {
                // Create a download link for the processed file
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'converted.txt';
                link.click();
                alert("Conversion complete! File downloaded.");
            })
            .catch(error => {
                console.error('Error:', error);
                alert("An error occurred while processing the file.");
            });
        });
    } else {
        console.error("Required elements not found. Check your HTML.");
    }
});