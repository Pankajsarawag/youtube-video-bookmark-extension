import BookmarkAddOutlinedIcon from "@mui/icons-material/BookmarkAddOutlined"
import DrawIcon from "@mui/icons-material/Draw"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import CardContent from "@mui/material/CardContent"
import CardMedia from "@mui/material/CardMedia"
import Typography from "@mui/material/Typography"
import * as React from "react"


export default function ImgMediaCard(props: any) {
  const [textFields, setTextFields] = React.useState(false)
  const [notes, setNotes] = React.useState("")

  const getTimestamp = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "retrieveTimestamp" })
    })
  }

  const handleBookmarkClick = () => {
    getTimestamp()
    setTextFields(false)
    props.setNotes(notes)
    setNotes("") 
    // window.location.reload()
  }

  let videoId = '';

    if (props.data.link && props.data.link.includes('youtube.com/watch?v=')) {
        videoId = props.data.link.split("v=")[1].split("&")[0];
    }

    const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : props.data.thumbnail;

  return (
    <>
      <Card sx={{ bgcolor: "rgb(16, 20, 24)", p: 0, mt:1 }}>
       
          <CardMedia
          component="img"
          alt="green iguana"
          image={thumbnailUrl}
        />
       
        <CardContent>
          <Typography variant="body2" color="white">
            {props.data.title}
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: "center", width: "100%" }}>
          <Button
            size="small"
            onClick={() => setTextFields(!textFields)}
            sx={{ width: "100%" }}>
            <DrawIcon sx={{ fontSize: 14, mr: 0.5 }} />
            Write a Note
          </Button>
        </CardActions>
      </Card>
      {textFields && (
        <div style={{ display: "grid" }}>
          <textarea
            className="auto-size-text-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write here..."
          />
          <Button size="small" onClick={handleBookmarkClick} sx={{ mt: 1 }}>
            <BookmarkAddOutlinedIcon sx={{ fontSize: 14, mr: 0.5 }} /> Bookmark
          </Button>
        </div>
      )}
    </>
  )
}
