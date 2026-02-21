const fs = require('fs');
const path = require('path');

const datasetDir = path.join(__dirname, 'archive (1)', 'public_dataset');

fs.readdir(datasetDir, (err, files) => {
    if (err) {
        console.error("Could not list directory.", err);
        return;
    }

    const jsonFiles = files.filter(f => f.endsWith('.json'));
    console.log(`Found ${jsonFiles.length} JSON files. Scanning...`);

    let symptomaticCount = 0;

    for (const file of jsonFiles) {
        try {
            const content = fs.readFileSync(path.join(datasetDir, file), 'utf-8');
            const data = JSON.parse(content);

            // Check for conditions
            const isSymptomatic = (data.status && data.status !== 'healthy') ||
                (data.respiratory_condition === 'True' || data.respiratory_condition === true) ||
                (data.fever_muscle_pain === 'True' || data.fever_muscle_pain === true);

            if (isSymptomatic) {
                console.log(`\n[SYMPTOMATIC FOUND]`);
                console.log(`File: ${file}`);
                console.log(`Audio File: ${file.replace('.json', '.webm')}`); // Assuming webm/ogg
                console.log(JSON.stringify(data, null, 2));
                symptomaticCount++;
                if (symptomaticCount >= 3) break; // Stop after finding 3 examples
            }
        } catch (e) {
            // Ignore parse errors
        }
    }

    if (symptomaticCount === 0) {
        console.log("No symptomatic cases found in the scanned files.");
    }
});
