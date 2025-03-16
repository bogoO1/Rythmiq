import { FFT_SIZE } from "./fft_size";
import { detectBeatChange } from "./audio_effects/audio_logic";

// Function to start audio processing
export async function startMicAudio() {
  try {
    // Create a new audio context
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    // Resume the audio context
    await audioContext.resume();

    // Get microphone input
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const analyser = handleSuccessMic(stream, audioContext);

    console.log("Audio context state:", audioContext.state);
    console.log("Audio stream connected successfully");
    return analyser;
  } catch (error) {
    console.error("Error accessing microphone:", error);
  }
}

function handleSuccessMic(stream, audioContext) {
  // Create a media stream source from the microphone input
  const mediaStreamSource = audioContext.createMediaStreamSource(stream);

  // Create an analyser node
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = FFT_SIZE * 2; // Set FFT size for frequency data

  // Connect the media stream source to the analyser
  mediaStreamSource.connect(analyser);

  return analyser;
  // Optionally, connect the analyser to the destination (speakers)
  // Uncomment the next line if you want to hear the audio
  // analyser.connect(audioContext.destination);
}

// Function to get frequency data
export function getFrequencyDataMic(analyser) {
  if (!analyser) {
    return new Uint8Array();
  }
  const frequencyData = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(frequencyData);
  return frequencyData;
}

export function startAudio(mic_wall) {
  try {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = FFT_SIZE;

    // Change the audio file path to a different format or location
    let audioElement = new Audio("audio_effects/EvanSong.mp3");
    audioElement.loop = true; // Set to loop if desired

    // Connect the audio element to the audio context
    let source = audioContext.createMediaElementSource(audioElement);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    // Play the audio
    audioElement
      .play()
      .then(() => {
        console.log("Audio is playing successfully");

        // Ensure the audio context is running
        if (audioContext.state === "suspended") {
          audioContext.resume().then(() => {
            // Delay the first call to detectBeatChange
            setTimeout(() => {
              detectBeatChange(analyser, mic_wall); // Call after resuming
            }, 100); // Delay for 100ms
          });
        } else {
          // Delay the first call to detectBeatChange
          setTimeout(() => {
            detectBeatChange(analyser, mic_wall); // Call directly if already running
          }, 100); // Delay for 100ms
        }
      })
      .catch((error) => {
        console.error("Error playing audio:", error);
      });

    console.log("Audio stream connected successfully");
    return analyser;
  } catch (error) {
    console.error("Error accessing audio context:", error);
  }
}

function handleSuccess(stream, audioContext) {
  // Create a media stream source from the microphone input
  const mediaStreamSource = audioContext.createMediaStreamSource(stream);

  // Create an analyser node
  analyser = audioContext.createAnalyser();
  analyser.fftSize = FFT_SIZE * 2; // Set FFT size for frequency data

  // Connect the media stream source to the analyser
  mediaStreamSource.connect(analyser);

  return analyser;
  // Optionally, connect the analyser to the destination (speakers)
  // Uncomment the next line if you want to hear the audio
  // analyser.connect(audioContext.destination);
}

// Function to get frequency data
export function getFrequencyData(analyser) {
  if (!analyser) {
    return new Uint8Array();
  }
  const frequencyData = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(frequencyData);
  return frequencyData;
}
