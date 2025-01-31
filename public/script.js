window.addEventListener('load', () => {
    const convertButton = document.getElementById('convertButton');
    if (convertButton) {
        convertButton.addEventListener('click', () => {
            console.log("Button clicked!"); // Just log a message
        });
    } else {
        console.log("Button not found!");
    }
});