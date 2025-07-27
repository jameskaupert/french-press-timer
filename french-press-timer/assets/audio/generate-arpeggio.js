#!/usr/bin/env node

/**
 * Musical Arpeggio Generator for French Press Timer
 * Generates 1-3-5-1 arpeggio sequences in various keys for timer notifications
 * 
 * Usage: node generate-arpeggio.js
 * Outputs: WAV files in the current directory
 */

const fs = require('fs');

class ArpeggioGenerator {
    constructor() {
        this.sampleRate = 44100;
        this.bitDepth = 16;
    }

    // Musical note frequencies (A4 = 440Hz)
    getNoteFrequency(note, octave = 4) {
        const noteMap = {
            'C': -9, 'C#': -8, 'Db': -8,
            'D': -7, 'D#': -6, 'Eb': -6,
            'E': -5, 'F': -4, 'F#': -3, 'Gb': -3,
            'G': -2, 'G#': -1, 'Ab': -1,
            'A': 0, 'A#': 1, 'Bb': 1,
            'B': 2
        };
        
        const semitones = noteMap[note] + (octave - 4) * 12;
        return 440 * Math.pow(2, semitones / 12);
    }

    // Generate 1-3-5-1 arpeggio pattern for a given root note
    generateArpeggioPattern(root, octave = 4) {
        const majorScale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const rootIndex = majorScale.indexOf(root);
        
        if (rootIndex === -1) throw new Error(`Invalid root note: ${root}`);
        
        // 1-3-5-1 pattern (root, major third, perfect fifth, root octave up)
        const intervals = [0, 2, 4, 7]; // Scale degrees: 1st, 3rd, 5th, 1st (octave)
        
        return intervals.map((interval, index) => {
            const noteIndex = (rootIndex + interval) % 7;
            const noteOctave = octave + Math.floor((rootIndex + interval) / 7) + (index === 3 ? 1 : 0);
            return this.getNoteFrequency(majorScale[noteIndex], noteOctave);
        });
    }

    // Generate sine wave for a given frequency and duration
    generateTone(frequency, duration, fadeIn = 0.1, fadeOut = 0.1) {
        const samples = Math.floor(this.sampleRate * duration);
        const buffer = new Float32Array(samples);
        
        for (let i = 0; i < samples; i++) {
            const t = i / this.sampleRate;
            let amplitude = Math.sin(2 * Math.PI * frequency * t);
            
            // Apply fade in/out to prevent clicks
            if (t < fadeIn) {
                amplitude *= t / fadeIn;
            } else if (t > duration - fadeOut) {
                amplitude *= (duration - t) / fadeOut;
            }
            
            buffer[i] = amplitude * 0.3; // Moderate volume
        }
        
        return buffer;
    }

    // Generate complete arpeggio sequence
    generateArpeggioSequence(root, octave = 4, noteDuration = 0.3, gapDuration = 0.1) {
        const frequencies = this.generateArpeggioPattern(root, octave);
        const sequences = [];
        
        frequencies.forEach((freq, index) => {
            const tone = this.generateTone(freq, noteDuration);
            sequences.push(tone);
            
            // Add gap between notes (except after last note)
            if (index < frequencies.length - 1) {
                const gap = new Float32Array(Math.floor(this.sampleRate * gapDuration));
                sequences.push(gap);
            }
        });
        
        // Concatenate all sequences
        const totalLength = sequences.reduce((sum, seq) => sum + seq.length, 0);
        const result = new Float32Array(totalLength);
        
        let offset = 0;
        sequences.forEach(seq => {
            result.set(seq, offset);
            offset += seq.length;
        });
        
        return result;
    }

    // Convert Float32Array to 16-bit PCM
    floatTo16BitPCM(float32Array) {
        const buffer = new ArrayBuffer(float32Array.length * 2);
        const view = new DataView(buffer);
        
        for (let i = 0; i < float32Array.length; i++) {
            const sample = Math.max(-1, Math.min(1, float32Array[i]));
            view.setInt16(i * 2, sample * 0x7FFF, true);
        }
        
        return buffer;
    }

    // Generate WAV file header
    generateWAVHeader(dataLength) {
        const buffer = new ArrayBuffer(44);
        const view = new DataView(buffer);
        
        // RIFF header
        view.setUint32(0, 0x46464952, false); // "RIFF"
        view.setUint32(4, 36 + dataLength, true); // File size
        view.setUint32(8, 0x45564157, false); // "WAVE"
        
        // fmt chunk
        view.setUint32(12, 0x20746D66, false); // "fmt "
        view.setUint32(16, 16, true); // Chunk size
        view.setUint16(20, 1, true); // Audio format (PCM)
        view.setUint16(22, 1, true); // Number of channels (mono)
        view.setUint32(24, this.sampleRate, true); // Sample rate
        view.setUint32(28, this.sampleRate * 2, true); // Byte rate
        view.setUint16(32, 2, true); // Block align
        view.setUint16(34, 16, true); // Bits per sample
        
        // data chunk
        view.setUint32(36, 0x61746164, false); // "data"
        view.setUint32(40, dataLength, true); // Data size
        
        return buffer;
    }

    // Save arpeggio as WAV file
    saveArpeggioWAV(root, filename, octave = 4) {
        const audioData = this.generateArpeggioSequence(root, octave);
        const pcmData = this.floatTo16BitPCM(audioData);
        const header = this.generateWAVHeader(pcmData.byteLength);
        
        const wavBuffer = new Uint8Array(header.byteLength + pcmData.byteLength);
        wavBuffer.set(new Uint8Array(header), 0);
        wavBuffer.set(new Uint8Array(pcmData), header.byteLength);
        
        fs.writeFileSync(filename, wavBuffer);
        console.log(`Generated: ${filename} (${root} major arpeggio)`);
    }

    // Generate all required arpeggios for the timer
    generateTimerArpeggios() {
        console.log('Generating musical arpeggios for French Press Timer...\n');
        
        // Different arpeggios for different timer events
        const configurations = [
            { root: 'C', filename: 'steeping-complete.wav', octave: 4 },      // Warm, welcoming
            { root: 'G', filename: 'stir-reminder.wav', octave: 4 },         // Bright, attention-getting
            { root: 'F', filename: 'brewing-complete.wav', octave: 3 },      // Lower, completion feeling
            { root: 'A', filename: 'default-notification.wav', octave: 4 }   // Pleasant default
        ];
        
        configurations.forEach(config => {
            this.saveArpeggioWAV(config.root, config.filename, config.octave);
        });
        
        console.log('\n✅ All arpeggio files generated successfully!');
        console.log('Files are ready for use in the French Press Timer application.');
    }
}

// Generate the arpeggios if run directly
if (require.main === module) {
    const generator = new ArpeggioGenerator();
    generator.generateTimerArpeggios();
}

module.exports = ArpeggioGenerator;