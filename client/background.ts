// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Forward the message to the popup script
  chrome.runtime.sendMessage(message);
});
