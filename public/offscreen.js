// Listen for messages from the extension
chrome.runtime.onMessage.addListener((msg) => {
  if ("play" in msg) playAudio(msg.play);
});

// Play sound with access to DOM APIs
function playAudio({ source, volume }) {
  const audio = new Audio(source);
  audio.volume = volume;
  audio.play();
}

// async function playSound(source = 'default.wav', volume = 1) {
//   await createOffscreen();
//   await chrome.runtime.sendMessage({ play: { source, volume } });
// }

// createOffscreen();
// Create the offscreen document if it doesn't already exist
// async function createOffscreen() {
//   if (await chrome.offscreen.hasDocument()) return;
//   await chrome.offscreen.createDocument({
//     url: "offscreen.html",
//     reasons: ["AUDIO_PLAYBACK"],
//     justification: "testing", // details for using the API
//   });
// }
