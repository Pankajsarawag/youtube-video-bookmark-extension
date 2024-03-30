const mongoose = require('mongoose');

const textSchema = new mongoose.Schema({
    textfield: {
        type: String,
    },
    timestamp: {
        type: String,
        required: true,
    },  
});

const noteSchema = new mongoose.Schema({
    link: {
        type: String,
        required: true,
    },
    text: [textSchema], 
    title: {
        type: String,
        trim: true,
    },
});

const notesSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
        unique: true,
    },
    notes: [noteSchema]
}, { timestamps: true });

const NotesModel = mongoose.model('Notes', notesSchema);

module.exports = NotesModel;