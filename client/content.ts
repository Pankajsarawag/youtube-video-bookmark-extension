import type { format } from "path";
import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/*"]
}

// Function to send a message to the background script
function sendMessageToBackground(message: { timestamp: Object, action?: string; }) {
  chrome.runtime.sendMessage(message);
}

window.addEventListener("load", () => {
  console.log(
    "You may find that having is not so pleasing a thing as wanting. This is not logical, but it is often true."
  );
});



chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {


  if (message.action === "setVideoData") {
    const title = (document.querySelector("#title.style-scope.ytd-watch-metadata") as HTMLElement).innerText;
    let link = window.location.href;

    if(link.includes("&t=")){
      link = link.split("&t=")[0];
    }
  
    //get the thumbnail https://img.youtube.com/vi/<insert-youtu be-video-id-here>/mqdefault.jpg
    console.log(link.split("v=")[1], "link");
    //maintin case sensitivity in the link
    const thumbnail = `https://img.youtube.com/vi/${link.split("v=")[1]}/mqdefault.jpg`;
    // console.log( thumbnail);
  
    sendMessageToBackground({ action: "setVideoData", timestamp: { title, link, thumbnail } });
  }

  if (message.action === "retrieveTimestamp") {
      // Get the element with class name ytp-progress-bar
  const progressBar = document.querySelector(".ytp-progress-bar");

  // console.log(progressBar);

  // Get the attribute aria-valuenow
  const duration = progressBar.getAttribute("aria-valuenow");
  const timestamp = progressBar.getAttribute("aria-valuetext");

  // console.log(duration, timestamp);

  sendMessageToBackground({ action: "setTimestamp", timestamp: timestamp + " / " + duration });
  }
});