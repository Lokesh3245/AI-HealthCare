const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, '../archive/Respiratory_Sound_Database/Respiratory_Sound_Database/audio_and_txt_files');
const DEMO_FILE = path.join(__dirname, '../archive/demographic_info.txt');
const DIAG_FILE = path.join(__dirname, '../archive/Respiratory_Sound_Database/Respiratory_Sound_Database/patient_diagnosis.csv');
const DEST_DIR = path.join(__dirname, '../public/data/respiratory_sound_database');
const DB_FILE = path.join(DEST_DIR, 'db.json');

// Ensure destination directory exists
if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
}

// 1. Parse Demographics
const demographics = {};
try {
    const demoContent = fs.readFileSync(DEMO_FILE, 'utf-8');
    demoContent.split(/\r?\n/).forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 2) {
            const id = parts[0];
            demographics[id] = {
                age: parts[1],
                sex: parts[2],
                bmi: parts[3],
                weight: parts[4],
                height: parts[5]
            };
        }
    });
    console.log(`Loaded demographics for ${Object.keys(demographics).length} patients.`);
} catch (err) {
    console.error("Error reading demographics:", err.message);
}

// 2. Parse Diagnosis
const diagnoses = {};
try {
    const diagContent = fs.readFileSync(DIAG_FILE, 'utf-8');
    diagContent.split(/\r?\n/).forEach(line => {
        const parts = line.trim().split(',');
        if (parts.length === 2) {
            const id = parts[0];
            diagnoses[id] = parts[1];
        }
    });
    console.log(`Loaded diagnoses for ${Object.keys(diagnoses).length} patients.`);
} catch (err) {
    console.error("Error reading diagnoses:", err.message);
}

// 3. Process Audio Files
const db = [];
try {
    const files = fs.readdirSync(SOURCE_DIR);
    const wavFiles = files.filter(f => f.endsWith('.wav'));

    console.log(`Found ${wavFiles.length} audio files. Processing...`);

    let processedCount = 0;

    wavFiles.forEach(wavFile => {
        // Filename format: 101_1b1_Al_sc_Meditron.wav
        // PatientID_Index_ChestLocation_AcquisitionMode_Equipment.wav
        const parts = wavFile.replace('.wav', '').split('_');

        if (parts.length >= 5) {
            const patientId = parts[0];
            const recordingIndex = parts[1];
            const chestLocation = parts[2];
            const acquisitionMode = parts[3];
            const equipment = parts[4];

            const txtFile = wavFile.replace('.wav', '.txt');
            const hasAnnotations = files.includes(txtFile);

            // Copy files
            fs.copyFileSync(path.join(SOURCE_DIR, wavFile), path.join(DEST_DIR, wavFile));
            if (hasAnnotations) {
                fs.copyFileSync(path.join(SOURCE_DIR, txtFile), path.join(DEST_DIR, txtFile));
            }

            // Annotation Data (Preview)
            let annotations = [];
            if (hasAnnotations) {
                const txtContent = fs.readFileSync(path.join(SOURCE_DIR, txtFile), 'utf-8');
                txtContent.split(/\r?\n/).forEach(line => {
                    const row = line.trim().split(/\s+/);
                    if (row.length >= 4) {
                        annotations.push({
                            start: parseFloat(row[0]),
                            end: parseFloat(row[1]),
                            crackles: parseInt(row[2]),
                            wheezes: parseInt(row[3])
                        });
                    }
                });
            }

            db.push({
                id: wavFile.replace('.wav', ''),
                filename: wavFile,
                annotationFile: hasAnnotations ? txtFile : null,
                patientId: patientId,
                demographics: demographics[patientId] || {},
                diagnosis: diagnoses[patientId] || 'Unknown',
                recordingIndex,
                chestLocation,
                acquisitionMode,
                equipment,
                annotations: annotations // Store full annotations or just summary
            });

            processedCount++;
            if (processedCount % 100 === 0) process.stdout.write('.');
        }
    });

    console.log(`\nProcessed ${processedCount} files.`);
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    console.log(`Database saved to ${DB_FILE}`);

} catch (err) {
    console.error("Error processing files:", err);
}
