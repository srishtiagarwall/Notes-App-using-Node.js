const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Users = require('./models/Users.js');
const Notes = require('./models/Notes.js');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('pages'));

const port = 8001;

mongoose.connect('mongodb://localhost:27017/Notes-App');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB!');
});

// Routes

// Endpoints to serve the HTML

app.get('/', (req, res) => {
    res.sendFile("pages/index.html", { root: __dirname });
});

app.get('/getNotes', async (req, res) => {
    try {
        const notes = await Notes.find();
        res.status(200).json({ success: true, notes });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch notes!' });
    }
});

app.get('/addNotes', (req, res) => {
    res.sendFile("pages/addNotes.html", { root: __dirname });
});

app.get('/yourNotes', (req, res) => {
    res.sendFile("pages/yourNotes.html", { root: __dirname });
});

app.get('/signup', (req, res) => {
    res.sendFile("pages/signup.html", { root: __dirname });
});

app.get('/login', (req, res) => {
    res.sendFile("pages/login.html", { root: __dirname });
});

// Endpoints for APIs

app.post('/signup', async (req, res) => { // signup API
    const { email, password } = req.body;
    console.log(req.body);

    const existingUser = await Users.findOne({ email });

    if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already exist!' });
    }

    let user = await Users.create({ email, password });
    res.status(200).json({ success: true, message: 'User created successfully!' });
});

app.post('/login', async (req, res) => { // login API
    let user = await Users.findOne(req.body);

    if (!user) {
        res.status(200).json({ success: false, message: 'No user found!' });
    }
    else {
        res.status(200).json({ success: true, user: { email: user.email }, message: 'User found!' });
    }
});

app.post('/addNote', async (req, res) => { // Add Note API
    const { title, desc } = req.body;

    try {
        const note = await Notes.create({ title, desc });
        res.status(200).json({ success: true, note });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to add note!' });
    }

});

app.post('/updateNote', async (req, res) => { // Update Note API
    try {
        const { title, desc } = req.body;

        const updatedNote = await Notes.findOneAndUpdate({ title }, { desc }, { new: true });

        if(updatedNote){
            res.status(200).json({ success: true, message: 'Note Edited!', updatedNote });
        }
        else {
            res.status(404).json({ success: false, message: 'Note not found.' });
        }
    }
    catch(error) {
        console.error('Error updating note:', error);
        res.status(500).json({ success: false, message: 'Failed to edit note!'});
    }
});

app.post('/deleteNote', async (req, res) => { // Delete Note API
    try {
        const { title, desc } = req.body;

        await Notes.findOneAndDelete({ title, desc });
        res.status(200).json({ success: true, messaage: 'Note deleted!' });
    }
    catch(error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ success: false, message: 'Failed to delete note!' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port} `);
});