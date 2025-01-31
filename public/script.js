document.getElementById('convertButton').addEventListener('click', () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const outputArea = document.getElementById('output'); // Get the output textarea

    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const fileContent = event.target.result;

            outputArea.value = ''; // Clear output area

            fetch('/convert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fileContent }),
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {throw new Error(err.error || 'Conversion failed')});
                }
                return response.json();
            })
            .then(data => {
                if (data.output) {
                    outputArea.value = data.output;
                } else if (data.error) {
                    console.error(data.error);
                    alert(data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert(error.message || 'An error occurred.');
            });
        };
        reader.readAsText(file);
    }
});