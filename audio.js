let audioContext;
let analyser;
let microphone;

// Function to start audio processing
export async function startAudio() {
  try {
    // Create a new audio context
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Resume the audio context
    await audioContext.resume();

    // Get microphone input
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    handleSuccess(stream);

    console.log("Audio context state:", audioContext.state);
    console.log("Audio stream connected successfully");
  } catch (error) {
    console.error("Error accessing microphone:", error);
  }
}

function handleSuccess(stream) {
  // Create a media stream source from the microphone input
  const mediaStreamSource = audioContext.createMediaStreamSource(stream);

  // Create an analyser node
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 128; // Set FFT size for frequency data

  // Connect the media stream source to the analyser
  mediaStreamSource.connect(analyser);

  // Optionally, connect the analyser to the destination (speakers)
  // Uncomment the next line if you want to hear the audio
  // analyser.connect(audioContext.destination);
}

// Function to get frequency data
export function getFrequencyData() {
  if (!analyser) {
    return new Uint8Array();
  }
  const frequencyData = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(frequencyData);
  return frequencyData;
}
