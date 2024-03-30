import { useEffect, useState } from "react"

import FullWidthTab from "~components/home"
import Login from "~components/login"

import "./components/style.css"

function IndexPopup() {
  const [login, setLogin] = useState(false)

  useEffect(() => {
  chrome.storage.local.get(["authToken", "id"], function (items) {
    try {
      if (chrome.runtime.lastError) {
        throw new Error(chrome.runtime.lastError.message);
      }
  
      if (items.authToken) {
        setLogin(true);
      } else {
        setLogin(false);
      }
    } catch (error) {
      console.error("Error retrieving data from chrome storage:", error);
    }
  });
}, []);
  

  return (
    <div
      style={{
        height: "510px",
        width: "300px",
        margin: 0,
        padding: 0,
        overflowY: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
      {login ? <FullWidthTab /> : <Login setLogin={setLogin} />}

      <style>
        {`
          ::-webkit-scrollbar {
            width: 0px;
            margin: 0px;
            padding: 0px;
          }
        `}
      </style>
    </div>
  )
}

export default IndexPopup
