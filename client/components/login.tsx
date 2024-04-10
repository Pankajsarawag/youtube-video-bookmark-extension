import GoogleIcon from "@mui/icons-material/Google"
import { Button, CircularProgress } from "@mui/material"
import axios from "axios"
import { useState } from "react"

function Login(props: any) {
  const [loading, setLoading] = useState(false)

  const login = async () => {
    setLoading(true)
    chrome.identity.getAuthToken({ interactive: true }, async (token) => {
      console.log(token)

      const res = await fetch("https://www.googleapis.com/oauth2/v1/userinfo", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await res.json()
      chrome.storage.local.set({ authToken: token, id: data.id })
      // console.log(data.id)

      try {
        // console.log(data, "data")
        axios.post("http://localhost:3000/api/user/register", {
          id: data.id,
          data: data
        })
      } catch (error) {
        console.error("Error fetching user data:", error)
        props.setLogin(true)
        props.setData(data)
        setLoading(false)
      }

      if (data.error) {
        console.log(data.error)
        props.setLogin(false)
        setLoading(false)
        return
      } else {
        console.log(data)
        props.setLogin(true)
        props.setData(data)
        setLoading(false)
      }
    })
  }

  return (
    <>
      {loading ? (
        <CircularProgress />
      ) : (
        <Button
          onClick={() => login()}
          variant="outlined"
          sx={{ justifyContent: "center" }}>
          Log In with Google <GoogleIcon sx={{ m: "0.25rem" }} />
        </Button>
      )}
    </>
  )
}

export default Login
