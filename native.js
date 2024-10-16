const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/New', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// User Schema
const UserSchema = new mongoose.Schema({
    name: String,
    phone: String,
    email: String,
    password: String
});

const User = mongoose.model('User', UserSchema);

// POST route to add a new user
app.post('/register', async (req, res) => {
    try {
        const newUser = new User({
            name: req.body.name,
            phone: req.body.phone,
            email: req.body.email,
            password: req.body.password
        });

        const user = await newUser.save();
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: 'Failed to register user' });
    }
});

// GET route to get all users
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(400).json({ error: 'Failed to fetch users' });
    }
});

// PUT route to update user
app.put('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name: req.body.name, password: req.body.password },
            { new: true }
        );
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: 'Failed to update user' });
    }
});

// DELETE route to delete user
app.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: 'Failed to delete user' });
    }
});

const port = 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
