// Importing required modules
const express = require("express")
const mongoose = require("mongoose")
const app = express()
const RegisterUser = require("./db/db")
const NotesModel = require("./db/notedb")

const cors = require("cors")
app.use(cors({ origin: "*" })) // Allow requests from any origin
app.use(express.json())

// Connection URL
const mongoURI = "mongodb://localhost:27017/youtube-video-bookmark"

// Connect to the database
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database")
  })
  .catch((error) => {
    console.error("Error connecting to the database", error)
  })

app.post("/api/user/register", async (req, res) => {
  try {
    if (!req.body.data) {
      return res.status(400).send("Invalid request data")
    }

    const { id, data } = req.body
    const { email, name, picture } = data

    let existingUser = await RegisterUser.findOne({ id })
    // console.log(existingUser)
    if (existingUser) {
      // If the user exists, send the data to the frontend
      return res.status(200).json(existingUser)
    } else {
      // If the user doesn't exist, create a new user entry
      const newUser = new RegisterUser({
        id,
        email,
        name,
        picture
      })
      //   console.log(newUser)
      // Save the new user entry to the database
      await newUser.save()
      return res.status(200).json("Successfully saved to db")
    }
  } catch (error) {
    console.error(error)
    return res.status(500).send("Internal server error")
  }
})

app.post("/api/getRegisterUser", async (req, res) => {
  try {
    const id = req.body.id
    const data = await RegisterUser.findOne({ id })
    // console.log(data);
    res.json(data)
  } catch (error) {
    console.error(error)
    res.status(500).send("error")
  }
})

app.post("/api/bookmark", async (req, res) => {
  // console.log(req.body)
  try {
    const { id, data } = req.body
    const user = id
    const link = data[0].link

    // Find the user's notes
    let userNotes = await NotesModel.findOne({ user })

    if (!userNotes) {
      // If user's notes don't exist, create a new entry
      userNotes = new NotesModel({
        user,
        notes: []
      })
    }

    const existingNote = userNotes.notes.find((note) => note.link === link)

    if (existingNote) {
      return res.status(400).json({ message: "Note already exists." })
    } 
    else {
      for (const noteData of data) {
        const { link, textfield, title, timestamp } = noteData
        userNotes.notes.push({
          link,
          text: [{ textfield, timestamp }],
          title
        })
      }
    }

  

    
    userNotes.notes.sort((a, b) => {
      return a.title.localeCompare(b.title)
    })

    userNotes.notes.sort((a, b) => {
      if (a.title === b.title) {
        return a.text[0].timestamp.localeCompare(b.text[0].timestamp)
      }
    })

    await userNotes.save()

    res.status(200).json({ message: "Notes saved successfully." })
  } catch (error) {
    console.error("Error:", error)
    res.status(500).json({ message: "Internal server error." })
  }
})

app.post("/api/getnotes", async (req, res) => {
  try {
    const user = req.body.id
    const data = await NotesModel.findOne({ user })

    res.json(data)
  } catch (error) {
    console.error(error)
    res.status(500).send("error")
  }
})

app.post("/api/editNote", async (req, res) => {
  try {
    const { id, noteid, text } = req.body
    // console.log(req.body);
    const user = id

    // Find the user's document in the database
    const userNotes = await NotesModel.findOne({ user })

    if (!userNotes) {
      return res.status(404).json({ message: "User not found." })
    }

    // Find the note in the user's notes array and update its textfield
    const noteToUpdate = userNotes.notes.find((note) => note._id == noteid)

    if (!noteToUpdate) {
      return res.status(404).json({ message: "Note not found." })
    }

    const oldTimestamp = noteToUpdate.text[0].timestamp

    //remove the old textfield and add the new textfield
    noteToUpdate.text.splice(0, 1)
    noteToUpdate.text.push({ textfield: text, timestamp: oldTimestamp })

    // console.log(noteToUpdate.text)

    // Save the updated user document
    await userNotes.save()

    res.status(200).json({})
    // console.log("Note updated successfully.")
  } catch (error) {
    console.error("Error:", error)
    res.status(500).json({ message: "Internal server error." })
  }
})

app.post("/api/deleteNote", async (req, res) => {
  try {
    const { id, noteid } = req.body
    const user = id

    // Update the NotesModel directly to remove the note with the specified _id
    await NotesModel.findOneAndUpdate(
      { user },
      { $pull: { notes: { _id: noteid } } }
    )

    // Fetch updated notes after deletion
    const updatedUser = await NotesModel.findOne({ user })
    await updatedUser.save()
    const updatedNotes = updatedUser


    res.status(200).json(updatedNotes)
    // console.log("Note deleted successfully.")
  } catch (error) {
    console.error("Error:", error)
    res.status(500).json({ message: "Internal server error." })
  }
})


// Set the port for the server
const port = 3000

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`)
})