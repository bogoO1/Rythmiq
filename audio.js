export const FFT_SIZE = 64;

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

export function startAudio(stream, audioContext) {
  try {
    console.log("stream: ", stream);
    const analyser = handleSuccess(stream, audioContext);
    console.log("Audio context state:", audioContext.state);
    console.log("Audio stream connected successfully");
    return analyser;
  } catch (error) {
    console.error("Error accessing microphone:", error);
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
