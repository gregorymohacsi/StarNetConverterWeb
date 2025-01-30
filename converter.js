// converter.js (FINAL-FIXES-V1)
function converter(inFile, outFile, callback) {
    const coordsLine = /Coordinate:\s+Name:\s+(?<name>.*)[^X]+X:\s+(?<X>[0-9.]+)[^Y]+Y:\s+(?<Y>[0-9.]+)[^Z]+Z:\s+(?<Z>[0-9.]+)/i;
    const measurementLine = /\s+Measurement:\s+H:\s+(?<h_degrees>[0-9]+).\s+(?<h_minutes>[0-9]+)'\s+(?<h_seconds>[0-9]+)"\s+V:\s+(?<v_degrees>[0-9]+).\s+(?<v_minutes>[0-9]+)'\s+(?<v_seconds>[0-9]+)"\s+S:\s+(?<S>[0-9]+\.[0-9]+)/m;
    const attributesLine = /N:pu_id\s+V:(?<attribute>.*(?=\n))/s;
    const instrumentHeight = /is_hi\s+V:(?<instrument_height>[0-9]+\.[0-9]+)/;
    const targetHeight = /N:target_height V:(?<target_height>[0-9]+\.[0-9]+)/;

    let coordsInfo = [];
    let output = "";

    const reader = new FileReader();
    reader.onload = (event) => {
        const fileContent = event.target.result;
        const lines = fileContent.split('\n');

        for (const line of lines) {
            const m = coordsLine.exec(line);
            if (m) {
                if (!coordsInfo.includes(m.groups.name)) {
                    coordsInfo.push(m.groups.name);
                    output += `C ${m.groups.name} ${m.groups.X} ${m.groups.Y} ${m.groups.Z}\n`;
                }
            }
        }
        output += "\n";

        let recentHorizontal = null;
        let measurementsFound = false;
        let currentCoords = null;
        let currentDMData = null;
        let instrumentHeightValue = null;
        let targetHeightValue = null;

        for (const line of lines) {
            const coordMatch = coordsLine.exec(line);

            if (coordMatch) {
                if (currentCoords && measurementsFound) {
                    output += "DE\n";
                }
                currentCoords = coordMatch.groups.name;
                output += `DB ${coordMatch.groups.name}\n`;
                recentInstrumentHeight = null;
                recentTargetHeight = null;
                attribute = null;
                recentHorizontal = null;
                measurementsFound = false;
                currentDMData = null;
                instrumentHeightValue = null;
                targetHeightValue = null;
            }

            const measurementMatch = measurementLine.exec(line);
            if (measurementMatch) {
                recentHorizontal = [measurementMatch.groups.h_degrees, measurementMatch.groups.h_minutes, measurementMatch.groups.h_seconds, measurementMatch.groups.S, measurementMatch.groups.v_degrees, measurementMatch.groups.v_minutes, measurementMatch.groups.v_seconds];
                measurementsFound = true;
            }

            const instrumentMatch = instrumentHeight.exec(line);
            if (instrumentMatch) {
                instrumentHeightValue = instrumentMatch.groups.instrument_height;
            }

            const attributeMatch = attributesLine.exec(line);
            if (attributeMatch) {
                attribute = attributeMatch.groups.attribute.trim();  //Trim whitespaces from attributes
                if (attribute[0] >= '0' && attribute[0] <= '9') {
                    attribute = 'CH' + attribute;
                }
            }

            const targetMatch = targetHeight.exec(line);
            if (targetMatch) {
                targetHeightValue = targetMatch.groups.target_height;
            }

            if (recentHorizontal && instrumentHeightValue && targetHeightValue && attribute) {
                currentDMData = `DM ${attribute} ${recentHorizontal.join('-')} ${instrumentHeightValue}/${targetHeightValue}\n`;
                output += currentDMData;
                currentDMData = null;
                instrumentHeightValue = null;
                targetHeightValue = null;
            }
        }

        if (currentCoords && measurementsFound) {
            output += "DE\n";
        }

        callback(output.replace(/\r\n/g, '\n'));
    };

    reader.readAsText(inFile);
}

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');

    if (fileInput) {
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                converter(file, 'output.txt', (convertedData) => {
                    const blob = new Blob([convertedData], { type: 'text/plain' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = 'converted.txt';
                    link.click();

                    const outputBlob = new Blob([convertedData], { type: 'text/plain' });
                    const reader = new FileReader();

                    reader.onload = (cleanupEvent) => {
                        const cleanedData = cleanupEvent.target.result;

                        const cleanedBlob = new Blob([cleanedData], { type: 'text/plain' });
                        const cleanedLink = document.createElement('a');
                        cleanedLink.href = URL.createObjectURL(cleanedBlob);
                        cleanedLink.download = 'converted_cleaned.txt';
                        cleanedLink.click();

                        alert("Conversion and cleanup complete!");
                    };

                    reader.readAsArrayBuffer(outputBlob);
                });
            }
        });
    } else {
        console.error("File input element not found. Check your HTML.");
    }
});