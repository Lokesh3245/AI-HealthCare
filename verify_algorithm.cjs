const fs = require('fs');

console.log("---------------------------------------------------");
console.log("   BREATHCARE AI - ALGORITHM TUNING & VERIFICATION");
console.log("---------------------------------------------------");

// --- 1. THE ALGORITHM (Ported EXACTLY from Home.jsx) ---
// Note: We mock the AudioBuffer interface simple object
const analyzeAudio = (audioBuffer) => {
    const rawData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const samples = rawData.length;

    // 1. Basic Features (Time Domain)
    let sumSquares = 0;
    let maxAmp = 0;
    let zeroCrossings = 0;

    for (let i = 0; i < samples; i++) {
        const val = rawData[i];
        const abs = Math.abs(val);
        sumSquares += val * val;
        if (abs > maxAmp) maxAmp = abs;

        if (i > 0 && ((val >= 0 && rawData[i - 1] < 0) || (val < 0 && rawData[i - 1] >= 0))) {
            zeroCrossings++;
        }
    }

    const rms = Math.sqrt(sumSquares / samples);
    const zcr = zeroCrossings / samples;

    // 2. MFCC Extraction Helper (Simplified)
    const extractMFCCs = (data, sampleRate) => {
        const fftSize = 512;
        const numFilters = 26;
        const numCepstra = 13;

        // A. Pre-emphasis
        const emphasized = new Float32Array(data.length);
        emphasized[0] = data[0];
        for (let i = 1; i < data.length; i++) {
            emphasized[i] = data[i] - 0.97 * data[i - 1];
        }

        // B. Framing (Max Energy Window)
        let bestStart = 0;
        let maxEnergy = 0;
        for (let i = 0; i < emphasized.length - fftSize; i += Math.floor(fftSize / 2)) {
            let e = 0;
            for (let j = 0; j < fftSize; j++) e += Math.abs(emphasized[i + j]);
            if (e > maxEnergy) {
                maxEnergy = e;
                bestStart = i;
            }
        }

        const frame = new Float32Array(fftSize);
        for (let i = 0; i < fftSize; i++) {
            const multiplier = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (fftSize - 1));
            frame[i] = emphasized[bestStart + i] * multiplier;
        }

        // C. FFT 
        const real = new Float32Array(fftSize);
        const imag = new Float32Array(fftSize);
        for (let i = 0; i < fftSize; i++) real[i] = frame[i];

        const computeFFT = (re, im) => {
            const n = re.length;
            if (n <= 1) return;
            const half = n / 2;
            const evenRe = new Float32Array(half); const evenIm = new Float32Array(half);
            const oddRe = new Float32Array(half); const oddIm = new Float32Array(half);
            for (let i = 0; i < half; i++) {
                evenRe[i] = re[2 * i]; evenIm[i] = im[2 * i];
                oddRe[i] = re[2 * i + 1]; oddIm[i] = im[2 * i + 1];
            }
            computeFFT(evenRe, evenIm); computeFFT(oddRe, oddIm);
            for (let k = 0; k < half; k++) {
                const angle = -2 * Math.PI * k / n;
                const c = Math.cos(angle); const s = Math.sin(angle);
                const tRe = c * oddRe[k] - s * oddIm[k];
                const tIm = s * oddRe[k] + c * oddIm[k];
                re[k] = evenRe[k] + tRe; im[k] = evenIm[k] + tIm;
                re[k + half] = evenRe[k] - tRe; im[k + half] = evenIm[k] - tIm;
            }
        };
        computeFFT(real, imag);

        const powerSpectrum = new Float32Array(fftSize / 2);
        for (let i = 0; i < fftSize / 2; i++) {
            powerSpectrum[i] = (real[i] * real[i] + imag[i] * imag[i]) / fftSize;
        }

        // D. Mel Filterbank
        const minHz = 0;
        const maxHz = sampleRate / 2;
        const melMin = 1125 * Math.log(1 + minHz / 700);
        const melMax = 1125 * Math.log(1 + maxHz / 700);
        const melPoints = new Float32Array(numFilters + 2);

        for (let i = 0; i < numFilters + 2; i++) {
            melPoints[i] = melMin + ((melMax - melMin) * i) / (numFilters + 1);
        }

        const hzPoints = new Float32Array(numFilters + 2);
        const binPoints = new Int32Array(numFilters + 2);
        for (let i = 0; i < numFilters + 2; i++) {
            hzPoints[i] = 700 * (Math.exp(melPoints[i] / 1125) - 1);
            binPoints[i] = Math.floor((fftSize + 1) * hzPoints[i] / sampleRate);
        }

        const filterEnergies = new Float32Array(numFilters);
        for (let m = 1; m <= numFilters; m++) {
            let sum = 0;
            for (let k = binPoints[m - 1]; k < binPoints[m]; k++) {
                sum += powerSpectrum[k] * (k - binPoints[m - 1]) / (binPoints[m] - binPoints[m - 1]);
            }
            for (let k = binPoints[m]; k < binPoints[m + 1]; k++) {
                sum += powerSpectrum[k] * (binPoints[m + 1] - k) / (binPoints[m + 1] - binPoints[m]);
            }
            filterEnergies[m - 1] = sum > 0 ? Math.log(sum) : 0;
        }

        // E. DCT
        const mfccs = new Float32Array(numCepstra);
        for (let n = 0; n < numCepstra; n++) {
            let sum = 0;
            for (let m = 0; m < numFilters; m++) {
                sum += filterEnergies[m] * Math.cos(Math.PI * n * (m + 0.5) / numFilters);
            }
            mfccs[n] = sum;
        }
        return mfccs;
    };

    const mfccs = extractMFCCs(rawData, sampleRate);

    // --- SCORING ---
    let spectralRoughness = 0;
    for (let i = 2; i < mfccs.length; i++) {
        spectralRoughness += Math.abs(mfccs[i]);
    }
    const roughnessNorm = Math.min(spectralRoughness / 50, 1);

    const signalStrength = Math.min(rms * 12, 1);
    const pathologyScore = (roughnessNorm * 0.6) + (Math.min(zcr * 5, 1) * 0.4);

    let probabilityIsCough = 1.0;
    if (zcr < 0.05) probabilityIsCough -= 0.4;
    if (mfccs[1] > 20) probabilityIsCough -= 0.3;

    let label = "Inconclusive";
    let risk = 0;

    if (probabilityIsCough < 0.5 && rms > 0.01) {
        risk = 20;
        label = "Speech Detected";
    } else if (signalStrength < 0.2) {
        risk = 10;
        label = "Too Quiet";
    } else {
        if (pathologyScore > 0.65) {
            risk = 70 + (pathologyScore * 29);
            label = "High Risk / COPD";
        } else if (pathologyScore > 0.45) {
            risk = 50 + (pathologyScore * 20);
            label = "Moderate Risk";
        } else {
            risk = 15 + (pathologyScore * 20);
            label = "Normal Cough";
        }
    }

    return { label, risk: Math.min(99, Math.round(risk)), stats: { rms, zcr, roughness: roughnessNorm, mfccs: Array.from(mfccs).slice(0, 5) } };
};

// --- 2. SYNTHETIC DATA GENERATORS ---

const generateWhiteNoise = (duration, sampleRate) => {
    const samples = duration * sampleRate;
    const data = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5; // -0.5 to 0.5 amplitude
    }
    return { getChannelData: () => data, sampleRate, length: samples };
};

const generateSineWave = (duration, sampleRate, freq) => {
    const samples = duration * sampleRate;
    const data = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
        data[i] = Math.sin(2 * Math.PI * freq * i / sampleRate) * 0.5;
    }
    return { getChannelData: () => data, sampleRate, length: samples };
};

const generateExplosiveCough = (duration, sampleRate) => {
    // Burst of noise then decay
    const samples = duration * sampleRate;
    const data = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
        const envelope = Math.exp(-3 * (i / samples)); // Fast decay
        data[i] = (Math.random() * 2 - 1) * 0.8 * envelope;
    }
    return { getChannelData: () => data, sampleRate, length: samples };
};

const generateWetCough = (duration, sampleRate) => {
    // Noise + Low Freq Rumble (Crackles)
    const samples = duration * sampleRate;
    const data = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
        const envelope = Math.exp(-2 * (i / samples));
        const noise = (Math.random() * 2 - 1);
        const rumble = Math.sin(2 * Math.PI * 150 * i / sampleRate); // 150Hz rumble
        data[i] = (noise * 0.6 + rumble * 0.4) * 0.8 * envelope;
    }
    return { getChannelData: () => data, sampleRate, length: samples };
};


// --- 3. RUN VERIFICATION ---

console.log("\nRunning Verification Bench...\n");

const tests = [
    { name: "Synthetic Silence/Quiet", data: generateWhiteNoise(1, 16000), ampScale: 0.01 }, // Quiet noise
    { name: "Synthetic Clean Speech (440Hz Tone)", data: generateSineWave(1, 16000, 440) },
    { name: "Synthetic Normal Cough (Dry Burst)", data: generateExplosiveCough(0.5, 16000) },
    { name: "Synthetic Infected Cough (Wet/Rough)", data: generateWetCough(0.5, 16000) }
];

tests.forEach(test => {
    // Apply amplitude scaling if needed (manual mute)
    if (test.ampScale) {
        const d = test.data.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] *= test.ampScale;
    }

    const result = analyzeAudio(test.data);
    console.log(`TEST: ${test.name}`);
    console.log(`  -> Label: ${result.label}`);
    console.log(`  -> Risk Score: ${result.risk}`);
    console.log(`  -> Stats: RMS=${result.stats.rms.toFixed(3)}, ZCR=${result.stats.zcr.toFixed(3)}, Roughness=${result.stats.roughness.toFixed(3)}`);
    console.log("");
});

console.log("---------------------------------------------------");
console.log("VERIFICATION COMPLETE");
