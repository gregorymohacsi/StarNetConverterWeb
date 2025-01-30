// starnet_cleanup.js
function cleanOutput(inFile, outFile, callback) {
    const fixMinutes = /(\d{2,3})-(\d)-(\d{1,2})/g;
    const fixSeconds = /(\d{2,3})-(\d{2})-(\d\s)/g;

    const padZero = (num) => num.toString().padStart(2, '0');

    const reader = new FileReader();
    reader.onload = (event) => {
        let s = event.target.result;

        s = s.replace(fixMinutes, (match, p1, p2, p3) => `${p1}-0${p2}-${padZero(p3)}`);
        s = s.replace(fixSeconds, (match, p1, p2, p3) => `${p1}-${p2}-0${padZero(p3)}`);

        const blob = new Blob([s], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = outFile;
        link.click();

        if (callback) {
            callback();
        }
    };
    reader.readAsText(inFile);
}