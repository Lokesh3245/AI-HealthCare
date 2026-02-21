const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, '../archive (1)/public_dataset');
const DEST_DIR = path.join(__dirname, '../public/data/cough_dataset');
const DB_FILE = path.join(DEST_DIR, 'db.json');

// Ensure destination directory exists
if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
}

const db = [];
const LIMIT = 500; // Limit for demo performance, remove for full ingestion

try {
    console.log(`Scanning ${SOURCE_DIR}...`);
    const files = fs.readdirSync(SOURCE_DIR);

    // Group files by UUID
    const fileGroups = {};
    files.forEach(f => {
        const ext = path.extname(f);
        const id = path.basename(f, ext);
        if (!fileGroups[id]) fileGroups[id] = {};
        if (ext === '.json') fileGroups[id].json = f;
        if (ext === '.webm' || ext === '.ogg') fileGroups[id].audio = f; // Supports both formats
    });

    console.log(`Found ${Object.keys(fileGroups).length} potential entries.`);

    let processedCount = 0;
    const entries = Object.entries(fileGroups);

    for (const [id, files] of entries) {
        if (processedCount >= LIMIT) break; // Optional limit

        if (files.json && files.audio) {
            try {
                // Read Metadata
                const jsonPath = path.join(SOURCE_DIR, files.json);
                const metadata = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

                // Copy files
                const destAudio = path.join(DEST_DIR, files.audio);
                fs.copyFileSync(path.join(SOURCE_DIR, files.audio), destAudio);

                // Add to DB
                db.push({
                    id: id,
                    audioFile: files.audio,
                    ...metadata
                });

                processedCount++;
                if (processedCount % 50 === 0) process.stdout.write('.');
            } catch (ignore) {
                // Ignore malformed files
            }
        }
    }

    console.log(`\nProcessed ${processedCount} valid entries (audio + metadata).`);
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    console.log(`Database saved to ${DB_FILE}`);

} catch (err) {
    console.error("Error processing files:", err);
}
