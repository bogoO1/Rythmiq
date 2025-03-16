import { FFT_SIZE } from "../fft_size";
import { changeEffect } from "../walls/audio_walls";
import { setBloomStrength } from "../post_processing/bloom_effect/bloom_audio";

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();

analyser.fftSize = FFT_SIZE;

const bufferLength = FFT_SIZE;
const timeData = new Float32Array(bufferLength);

let lastDetectionTime = performance.now();
const frequencyData = new Uint8Array(bufferLength);
let lastBassEnergy = 0;
let lastTempo = 0;
let lastVolume = 0;

export function detectBeatChange(analyser, mic_wall) {
  //   if (!(analyser instanceof AnalyserNode)) {
  //     console.error("Provided analyser is not an instance of AnalyserNode");
  //     return; // Exit if the analyser is not valid
  //   }

  //   // Check if timeData is being filled correctly
  //   analyser.getFloatTimeDomainData(timeData);

  //   let bpm = estimateBPM(timeData);
  //   let now = performance.now();

  //   if (Math.abs(bpm - lastTempo) > 5) {
  //     // Detect tempo change
  //     console.log(`Beat Change Detected! New BPM: ${bpm}`);
  //     onBeatChange(bpm, mic_wall);
  //     lastDetectionTime = now;
  //   }

  //   lastTempo = bpm;

  //   analyser.getByteFrequencyData(frequencyData);

  //   // Focus on low frequencies (bass is usually below 150Hz)
  //   let bassRange = frequencyData.slice(0, 32); // First 20 bins (~0-150Hz)
  //   let bassEnergy =
  //     bassRange.reduce((sum, value) => sum + value, 0) / bassRange.length;

  //   // Detect a significant drop in bass energy
  //   if (bassEnergy < lastBassEnergy * 0.5 || bassEnergy > lastBassEnergy * 1.5) {
  //     console.log("🔥 Bass Drop Detected! 🔥");
  //     onBeatChange(mic_wall);
  //   }

  //   lastBassEnergy = bassEnergy;

  analyser.getByteFrequencyData(frequencyData);
  analyser.getFloatTimeDomainData(timeData);

  let bassEnergy = getBassEnergy();
  let avgVolume = getAverageVolume();
  let bpm = estimateBPM(timeData);

  if (Math.abs(bpm - lastTempo) > 5) {
    console.log(`Beat Change Detected! New BPM: ${bpm}`);
    onBeatChange(mic_wall, avgVolume, bassEnergy, bpm);
  }

  if (avgVolume > lastVolume * 1.3) {
    console.log("Volume Spike Detected!");
    onBeatChange(mic_wall, avgVolume, bassEnergy, bpm);
  }

  if (lastBassEnergy > 0 && bassEnergy < lastBassEnergy * 0.5) {
    console.log("Bass Drop Detected!");
    onBeatChange(mic_wall, avgVolume, bassEnergy, bpm);
  }

  lastBassEnergy = bassEnergy;
  lastTempo = bpm;
  lastVolume = avgVolume;

  requestAnimationFrame(() => detectBeatChange(analyser, mic_wall)); // Ensure the function is called recursively
}
function getBassEnergy() {
  let bassRange = frequencyData.slice(0, 20); // First 20 bins (~0-150Hz)
  return bassRange.reduce((sum, value) => sum + value, 0) / bassRange.length;
}

// Estimate BPM using Auto-Correlation
function estimateBPM(samples) {
  let peaks = [];
  let threshold = 0.6;

  for (let i = 1; i < samples.length - 1; i++) {
    if (
      samples[i] > threshold &&
      samples[i] > samples[i - 1] &&
      samples[i] > samples[i + 1]
    ) {
      peaks.push(i);
    }
  }

  if (peaks.length < 2) return lastTempo;

  let intervals = peaks.slice(1).map((p, i) => p - peaks[i]);
  let avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  return Math.round(60 / (avgInterval / audioContext.sampleRate));
}

function getAverageVolume() {
  let sum = frequencyData.reduce((a, b) => a + b, 0);
  return sum / frequencyData.length;
}

function onBeatChange(mic_wall, avgVolume, bassEnergy, bpm) {
  // Normalize values (assuming reasonable min/max ranges)
  const normVolume = avgVolume / 255; // 0 to 1 (raw data is 0-255)
  const normBass = bassEnergy / 255; // 0 to 1 (raw data is 0-255)
  const normBPM = Math.min(bpm / 200, 1); // 0 to 1 (capping at 200 BPM)

  // Weighted combination
  const energyScore = 0.9 * (0.5 * normVolume + 0.3 * normBass + 0.2 * normBPM);
  changeEffect(mic_wall);
  setBloomStrength(energyScore);
  console.log("BEAT DROP");
}
