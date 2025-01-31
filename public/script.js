window.addEventListener('load', () => {
    console.log("Window load event fired.");

    const convertButton = document.getElementById('convertButton');
    console.log("convertButton:", convertButton);

    if (convertButton) {
        console.log("Convert button element found.");
        convertButton.addEventListener('click', () => {
            console.log("Convert button clicked.");
            // ... (Your fetch and file reading logic will go here eventually)
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