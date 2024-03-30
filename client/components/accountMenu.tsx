import LogoutIcon from "@mui/icons-material/Logout"
import { Button, CircularProgress } from "@mui/material"
import Avatar from "@mui/material/Avatar"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import axios from "axios"
import * as React from "react"
import { useEffect, useState } from "react"

export default function AccountMenu() {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [picture, setPicture] = useState("")

  useEffect(() => {
    chrome.storage.local.get(["authToken", "id"], async function (result) {
      axios
        .post("http://localhost:3000/api/getRegisterUser", {
          id: result.id
        })
        .then((response) => {
          // console.log(response.data, "data");
          setName(response.data.name)
          setPicture(response.data.picture)
        })
        .catch((error) => {
          console.error("Error fetching user data:", error)
        })
    })
  }, [])

  const logout = () => {
    // console.log("Logging out...")
    setLoading(true)

    chrome.storage.local.get(["authToken"], function (token) {
      // console.log(token.authToken)

      chrome.identity.removeCachedAuthToken(
        { token: token.authToken },
        function () {
          var error = chrome.runtime.lastError
          if (error) {
            console.error(error)
          }
        }
      )

      const xhr = new XMLHttpRequest()
      xhr.open(
        "GET",
        "https://accounts.google.com/o/oauth2/revoke?token=" + token.authToken
      )
      xhr.send()

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          chrome.storage.local.remove(["authToken"], function () {
            var error = chrome.runtime.lastError
            if (error) {
              console.error(error)
            }
          })
          setTimeout(function () {
            window.location.reload()
          }, 500)
        }
      }
    })
  }

  return (
    <React.Fragment>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          position: "fixed",
          zIndex: 1,
          background: "rgba(16, 20, 24)"
        }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "start",
            alignItems: "center",
            width: 140
          }}>
          <Avatar sx={{ width: 25, height: 25, mx: 1 }} src={picture} />
          <Typography variant="h6" component="div" sx={{ fontSize: 15 }}>
            {name}
          </Typography>
        </Box>

        <Button
          onClick={logout}
          sx={{ color: "#CACFD2", ml: 13.3, width: "5px" }}>
          {loading ? (
            <CircularProgress size={18} />
          ) : (
            <LogoutIcon sx={{ fontSize: 20 }} />
          )}
        </Button>
      </Box>
    </React.Fragment>
  )
}
