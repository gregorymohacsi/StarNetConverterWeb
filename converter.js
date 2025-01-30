// converter.js logic
function converter(inFile, outFile, callback) {
    const coordsLine = /Coordinate:\s+Name:\s+(?<name>.*)[^X]+X:\s+(?<X>[0-9.]+)[^Y]+Y:\s+(?<Y>[0-9.]+)[^Z]+Z:\s+(?<Z>[0-9.]+)/i;
    const measurementLine = /\s+Measurement:\s+H:\s+(?<h_degrees>[0-9]+).\s+(?<h_minutes>[0-9]+)'\s+(?<h_seconds>[0-9]+)"\s+V:\s+(?<v_degrees>[0-9]+).\s+(?<v_minutes>[0-9]+)'\s+(?<v_seconds>[0-9]+)"\s+S:\s+(?<S>[0-9]+\.[0-9]+)/m;
    const attributesLine = /N:pu_id\s+V:(?<attribute>.*(?=\n))/s;
    const instrumentHeight = /is_hi\s+V:(?<instrument_height>[0-9]+\.[0-9]+)/;
    const targetHeight = /N:target_height V:(?<target_height>[0-9]+\.[0-9]+)/;

    const reader = new FileReader();
    reader.onload = (event) => {
        const fileContent = event.target.result;
        const lines = fileContent.split('\n');

        // First collect all unique coordinates
        const coordsMap = new Map();
        for (const line of lines) {
            const m = coordsLine.exec(line);
            if (m && !coordsMap.has(m.groups.name)) {
                coordsMap.set(m.groups.name, {
                    X: m.groups.X,
                    Y: m.groups.Y,
                    Z: m.groups.Z
                });
            }
        }

        // Build coordinates section
        let output = '';
        for (const [name, coords] of coordsMap) {
            output += `C ${name} ${coords.X} ${coords.Y} ${coords.Z}\n`;
        }
        output += '\n';  // Single blank line after coordinates

        // Process measurements
        let currentStation = null;
        let measurementData = {
            horizontal: null,
            instrumentHeight: null,
            targetHeight: null,
            attribute: null
        };

        for (const line of lines) {
            const coordMatch = coordsLine.exec(line);
            if (coordMatch) {
                if (currentStation) {
                    output += 'DE\n\n';
                }

                currentStation = coordMatch.groups.name;
                output += `DB ${currentStation}\n`;

                // Reset measurement data
                measurementData = {
                    horizontal: null,
                    instrumentHeight: null,
                    targetHeight: null,
                    attribute: null
                };
            }

            const measurementMatch = measurementLine.exec(line);
            if (measurementMatch) {
                measurementData.horizontal = {
                    h_degrees: padZero(measurementMatch.groups.h_degrees),
                    h_minutes: padZero(measurementMatch.groups.h_minutes),
                    h_seconds: padZero(measurementMatch.groups.h_seconds),
                    S: measurementMatch.groups.S,
                    v_degrees: padZero(measurementMatch.groups.v_degrees),
                    v_minutes: padZero(measurementMatch.groups.v_minutes),
                    v_seconds: padZero(measurementMatch.groups.v_seconds)
                };
            }

            const instrumentMatch = instrumentHeight.exec(line);
            if (instrumentMatch) {
                measurementData.instrumentHeight = instrumentMatch.groups.instrument_height;
            }

            const attributeMatch = attributesLine.exec(line);
            if (attributeMatch) {
                let attr = attributeMatch.groups.attribute.trim();
                if (attr[0] >= '0' && attr[0] <= '9') {
                    attr = 'CH' + attr;
                }
                measurementData.attribute = attr;
            }

            const targetMatch = targetHeight.exec(line);
            if (targetMatch) {
                measurementData.targetHeight = targetMatch.groups.target_height;

                // If we have all required data, output the measurement
                if (measurementData.horizontal && measurementData.instrumentHeight && measurementData.attribute) {
                    const h = measurementData.horizontal;
                    output += `DM ${measurementData.attribute} ${h.h_degrees}-${h.h_minutes}-${h.h_seconds} ${h.S} ${h.v_degrees}-${h.v_minutes}-${h.v_seconds} ${measurementData.instrumentHeight}/${measurementData.targetHeight}\n`;
                }
            }
        }

        // Close the last station
        if (currentStation) {
            output += 'DE\n';
        }

        callback(output);
    };

    reader.readAsText(inFile);
}

// Utility function to pad numbers with leading zeros
function padZero(num) {
    return num.toString().padStart(2, '0');
}

// DOM event listener setup
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

                    // Clean up the output
                    const outputBlob = new Blob([convertedData], { type: 'text/plain' });
                    cleanOutput(outputBlob, 'converted_cleaned.txt', () => {
                        alert("Conversion and cleanup complete!");
                    });
                });
            }
        });
    } else {
        console.error("File input element not found. Check your HTML.");
    }
});