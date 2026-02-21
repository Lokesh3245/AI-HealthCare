import React, { useRef, useEffect } from 'react';

function AudioVisualizer({ audioSrc }) {
    const canvasRef = useRef(null);
    const audioRef = useRef(null);
    const contextRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);

    useEffect(() => {
        if (!audioSrc) return;

        const audio = audioRef.current;

        const initAudio = () => {
            if (!contextRef.current) {
                contextRef.current = new (window.AudioContext || window.webkitAudioContext)();
                analyserRef.current = contextRef.current.createAnalyser();
                sourceRef.current = contextRef.current.createMediaElementSource(audio);
                sourceRef.current.connect(analyserRef.current);
                analyserRef.current.connect(contextRef.current.destination);
            }
        };

        const draw = () => {
            if (!canvasRef.current || !analyserRef.current) return;

            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            analyserRef.current.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Modern gradient visualization
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, '#06b6d4');
            gradient.addColorStop(1, '#3b82f6');
            ctx.fillStyle = gradient;

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2;
                // Round edges
                ctx.beginPath();
                ctx.roundRect(x, canvas.height - barHeight, barWidth, barHeight, [4, 4, 0, 0]);
                ctx.fill();
                x += barWidth + 1;
            }

            requestAnimationFrame(draw);
        };

        audio.addEventListener('play', () => {
            initAudio();
            if (contextRef.current.state === 'suspended') contextRef.current.resume();
            draw();
        });

        return () => {
            // cleanup if needed
        };
    }, [audioSrc]);

    return (
        <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <canvas
                ref={canvasRef}
                width="300"
                height="60"
                style={{ width: '100%', height: '60px' }}
            />
            <audio
                ref={audioRef}
                src={audioSrc}
                controls
                style={{ width: '100%', height: '36px' }}
            />
        </div>
    );
}

export default AudioVisualizer;
