import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined"
import DrawIcon from "@mui/icons-material/Draw"
import SaveIcon from "@mui/icons-material/Save"
import SearchIcon from "@mui/icons-material/Search"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardMedia from "@mui/material/CardMedia"
import IconButton from "@mui/material/IconButton"
import InputBase from "@mui/material/InputBase"
import { alpha, styled } from "@mui/material/styles"
import Typography from "@mui/material/Typography"
import axios from "axios"
import * as React from "react"

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "#191B1F",
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.05)
  },
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(3),
    width: "auto"
  }
}))

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(0)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch"
    }
  }
}))

export default function MediaControlCard(props: any) {
  const [notesData, setNotesData] = React.useState<any>()
  const [value, setValue] = React.useState<any>()
  const [textFields, setTextFields] = React.useState<Array<boolean>>(
    Array(notesData).fill(false)
  )
  const [search, setSearch] = React.useState<string>("")
  const [Bookmark, setBookmark] = React.useState<boolean>(true)

  React.useEffect(() => {
    chrome.storage.local.get(["authToken", "id"], async function (result) {
      // console.log("userData", props.userData)

      axios
        .post("http://localhost:3000/api/getnotes", {
          id: result.id
        })
        .then((response) => {
          if (!props.data) {
            setNotesData(response.data)
            return
          }
          // console.log(response.data, "data")
          const notesres = response.data

          const { title } = props.data
          let notes = notesres.notes

          const matchingNotes = notes.filter(
            (note: any) => note.title === title
          )
          const remainingNotes = notes.filter(
            (note: any) => note.title !== title
          )

          matchingNotes.sort((a: any, b: any) => {
            return (
              new Date(a.text[0].timestamp).getTime() -
              new Date(b.text[0].timestamp).getTime()
            )
          })

          const sortedNotes = [...matchingNotes, ...remainingNotes]

          setNotesData({ notes: sortedNotes })

          console.log("Sorted notes:", notesData)
        })
        .catch((error) => {
          console.error("Error fetching user data:", error)
        })
    })
  }, [])

  const handleToggleTextFields = (index: number) => {
    setTextFields((prev) => {
      const newFields = [...prev]
      newFields[index] = !newFields[index]
      return newFields
    })
  }

  const deleteNote = async (noteId: any) => {
    chrome.storage.local.get(["authToken", "id"], async function (result) {
      try {
        const response = await axios.post(
          "http://localhost:3000/api/deleteNote",
          {
            id: result.id,
            noteid: noteId
          }
        )
        console.log(notesData.notes)

        const newNotesData = notesData.notes.filter(
          (note: any) => note._id !== noteId
        )
        setNotesData({ notes: newNotesData })
      } catch (error) {
        console.error("Error deleting note:", error)
      }
    })
  }

  const saveEditNotes = async (noteId: any) => {
    chrome.storage.local.get(["authToken", "id"], async function (result) {
      try {
        const response = await axios.post(
          "http://localhost:3000/api/editNote",
          {
            id: result.id,
            noteid: noteId,
            text: value
          }
        )
        // console.log("Note edited:")
      } catch (error) {
        console.error("Error editing note:", error)
      }
    })
  }

  return (
    <>
      <Search sx={{ display: "flex", alignItems: "center", mt:1 }}>
        <SearchIcon sx={{ ml: 2 }} />
        <StyledInputBase
          placeholder="Search…"
          inputProps={{ "aria-label": "search" }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Search>

      {notesData &&
        notesData.notes
          ?.filter((note: any) =>
            note.title.toLowerCase().includes(search.toLowerCase())
          )
          .map((element: any, index: number) => (
            <div key={index}>
              <Card
                sx={{
                  my: 1,
                  background: "#191B1F",
                  elevation: 5
                }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column"
                    }}>
                    <p
                      style={{
                        color: "white",
                        fontSize: 10,
                        justifyContent: "center",
                        padding: "2px 5px"
                      }}>
                      {element.title}
                    </p>

                    <Box>
                      {textFields[index] && (
                        <IconButton
                          aria-label="delete"
                          sx={{ color: "white" }}
                          onClick={() => {
                            handleToggleTextFields(index)
                            saveEditNotes(element._id)
                            element.text[0].textfield = value
                          }}>
                          <SaveIcon sx={{ color: "#CACFD2" }} />
                        </IconButton>
                      )}
                      {!textFields[index] && (
                        <IconButton
                          aria-label="delete"
                          sx={{ color: "white" }}
                          onClick={() => {
                            handleToggleTextFields(index)
                          }}>
                          <DrawIcon sx={{ color: "#CACFD2" }} />
                        </IconButton>
                      )}

                      <IconButton
                        aria-label="delete"
                        sx={{ color: "white" }}
                        onClick={() => {
                          deleteNote(element._id)
                        }}>
                        <DeleteOutlinedIcon sx={{ color: "#CACFD2" }} />
                      </IconButton>
                      <Button href={element.link} sx={{ mr: 0.2 }}>
                        {element.text[0].timestamp}
                      </Button>
                    </Box>
                  </Box>

                  <CardMedia
                    component="img"
                    sx={{ width: "50%", height: "100" }}
                    image={`https://img.youtube.com/vi/${element.link.split("v=")[1].split("&")[0]}/mqdefault.jpg`}
                    alt="Live from space album cover"
                  />
                </Box>

                {!textFields[index] && element.text[0].textfield != "" && (
                  <Typography variant="body2" color="white" sx={{ p: 1 }}>
                    {element.text[0].textfield}
                  </Typography>
                )}
                {textFields[index] && (
                  <textarea
                    className="auto-size-text-input"
                    defaultValue={element.text[0].textfield}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Write here..."
                  />
                )}
              </Card>
            </div>
          ))}
    </>
  )
}
