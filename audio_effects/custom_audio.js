// TODO later

export async function setUpCustomAudio(callback) {
  try {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    // Check if the audio context is in a suspended state
    if (audioContext.state === "suspended") {
      await audioContext.resume(); // Resume the context if it's suspended
    }

    console.log("AudioContext initialized:", audioContext);

    // Add event listener for the file input
    document
      .getElementById("audioUpload")
      .addEventListener("change", (event) =>
        handleAudioUpload(event, callback, audioContext)
      );
  } catch (error) {
    console.error("Error initializing AudioContext:", error);
  }
}

function createMediaStreamFromAudioBuffer(audioBuffer, audioContext) {
  if (!audioContext) {
    console.error("AudioContext is not initialized.");
    return null; // Return null if audioContext is not available
  }

  const mediaStream = new MediaStream();
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;

  // Create a ScriptProcessorNode to process the audio data
  const processor = audioContext.createScriptProcessor(4096, 1, 1);

  // Connect the source to the processor
  source.connect(processor);
  processor.connect(audioContext.destination); // Connect to the audio context's destination

  // Create a MediaStreamAudioSourceNode
  //   const mediaStreamSource = audioContext.createMediaStreamSource(mediaStream);

  // Connect the processor to the media stream source
  processor.onaudioprocess = (event) => {
    const outputBuffer = event.outputBuffer;
    const inputData = source.buffer.getChannelData(0); // Get audio data from the buffer
    const outputData = outputBuffer.getChannelData(0);

    // Copy the audio data to the output buffer
    for (let i = 0; i < outputBuffer.length; i++) {
      outputData[i] = inputData[i] || 0; // Fill with audio data or silence
    }
  };

  source.start(0); // Start the audio playback
  return mediaStream; // Return the media stream
}

function handleAudioUpload(event, callback, audioContext) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      audioContext.decodeAudioData(e.target.result, function (buffer) {
        const mediaStream = createMediaStreamFromAudioBuffer(
          buffer,
          audioContext
        ); // Create media stream from audio buffer
        console.log("media stream: ", mediaStream, audioContext);
        console.log("audio context: ", audioContext);
        callback(mediaStream, audioContext); // Call the callback with the media stream

        // Play the audio buffer
        playAudio(buffer, audioContext);
      });
    };
    reader.readAsArrayBuffer(file);
  }
}

function playAudio(buffer, audioContext) {
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination); // Connect to the audio context's destination
  source.start(0); // Start playback
}
