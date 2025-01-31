window.addEventListener('load', () => {
    console.log("Window load event fired.");

    const convertButton = document.getElementById('convertButton');
    console.log("convertButton:", convertButton);

    if (convertButton) {
        console.log("Convert button element found.");
        convertButton.addEventListener('click', () => {
            const fileInput = document.getElementById('fileInput');
            const file = fileInput.files[0];
            const outputArea = document.getElementById('output');

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
    } else {
        console.log("Convert button element NOT found.");
    }

    const fileInput = document.getElementById('fileInput');
    console.log("fileInput:", fileInput);

    if (fileInput) {
        console.log("fileInput element found.");
    } else {
        console.log("fileInput element NOT found.");
    }

    const outputArea = document.getElementById('output');
    console.log("outputArea:", outputArea);

    if (outputArea) {
        console.log("outputArea element found.");
    } else {
        console.log("outputArea element NOT found.");
    }
});