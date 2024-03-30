import BookmarkAddedOutlinedIcon from "@mui/icons-material/BookmarkAddedOutlined"
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined"
import Box from "@mui/material/Box"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import Typography from "@mui/material/Typography"
import axios from "axios"
import * as React from "react"
import Button from '@mui/material/Button';

import AccountMenu from "./accountMenu"
import MediaControlCard from "./bookmarked"
import ImgMediaCard from "./card"

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}>
      {value === index && (
        <Box>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`
  }
}

function convertToTimestamp(data: String) {
  // Define regex patterns for hours, minutes, and seconds
  const hoursPattern = /(\d+)\s*Hours?/
  const minutesPattern = /(\d+)\s*Minutes?/
  const secondsPattern = /(\d+)\s*Seconds?/

  // Extract hours, minutes, and seconds using regex
  const hoursMatch = data.match(hoursPattern)
  const minutesMatch = data.match(minutesPattern)
  const secondsMatch = data.match(secondsPattern)

  // Initialize variables for hours, minutes, and seconds
  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0
  const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0
  const seconds = secondsMatch ? parseInt(secondsMatch[1], 10) : 0

  // Format the timestamp as HH:mm:ss
  const timestamp = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

  return timestamp
}

function convertToSeconds(timestamp: String) {
  // console.log(timestamp)
  const [hours, minutes, seconds] = timestamp.split(":").map(Number)
  // console.log(hours, minutes, seconds)
  return hours * 3600 + minutes * 60 + seconds
}

export default function FullWidthTab() {
  const [videodata, setVideoData] = React.useState<any>()
  const [timestamp, setTimestamp] = React.useState<any>()
  const [value, setValue] = React.useState(0)
  const [notes, setNotes] = React.useState<any>("")

  const postBookmark = async (postData: any) => {
    chrome.storage.local.get(["authToken", "id"], async function (result) {
      if (result.authToken && result.id) {
        const authToken = result.authToken
        const id = result.id

        try {
          const response = await axios.post(
            "http://localhost:3000/api/bookmark",
            {
              token: authToken,
              id: id,
              data: postData
            }
          )

          console.log("Success:", response.data)
        } catch (error) {
          console.error("Error:", error)
        }
      } else {
        console.log("Data not found in storage.")
      }
    })
  }

  React.useEffect(() => {
    if (videodata && timestamp) {
      const postData = {
        timestamp: convertToTimestamp(timestamp.timestamp) || undefined,
        link:
          videodata.link +
            "&t=" +
            convertToSeconds(
              convertToTimestamp(timestamp.timestamp)
            ).toString() || undefined,
        title: videodata.title || undefined,
        textfield: notes
      }

      // console.log("postData", postData)

      postBookmark([postData])
    }
  }, [timestamp, videodata])

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "setVideoData") {
      setVideoData(message.timestamp)
    }

    if (message.action === "setTimestamp") {
      setTimestamp(message)
    }
  })

  React.useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "setVideoData" })
    })
  }, [])

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  return (
    <Box sx={{ width: "100%", height: "100%", zIndex: 2 }}>
      <AccountMenu />

      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          width: "100%",
          position: "fixed",
          mt: 4,
          background: "rgba(16, 20, 24)",
          zIndex: 1
        }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
          sx={{ width: "100%" }}>
          <Tab
            label={
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center"
                }}>
                <PlayCircleOutlinedIcon
                  sx={{ fontSize: 18, m: 0, color: "#1976d2" }}
                />
                <Typography
                  variant="body1"
                  sx={{ ml: 1, fontSize: 14, color: "#1976d2" }}>
                  Playing
                </Typography>
              </Box>
            }
            iconPosition="start"
            {...a11yProps(0)}
            sx={{ width: "50%", fontSize: 15, display: "flex" }}
          />
          <Tab
            label={
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center"
                }}>
                <BookmarkAddedOutlinedIcon
                  sx={{ fontSize: 18, m: 0, color: "#1976d2" }}
                />
                <Typography
                  variant="body1"
                  sx={{ ml: 1, fontSize: 14, color: "#1976d2" }}>
                  bookmarks
                </Typography>
              </Box>
            }
            iconPosition="start"
            {...a11yProps(0)}
            sx={{ width: "50%", fontSize: 15, display: "flex" }}
          />
        </Tabs>
      </Box>
      <Box sx={{ mt: 10, overflow: "auto" }}>
        <CustomTabPanel value={value} index={0}>
          {videodata && <ImgMediaCard data={videodata} setNotes={setNotes} />}
          {!videodata && (
            <div style={{ 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center", 
              height:380
            }}>
              Play YouTube video
            </div>
          )}
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <MediaControlCard data={videodata} />
        </CustomTabPanel>
      </Box>
    </Box>
  )
}
