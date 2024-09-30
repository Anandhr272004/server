const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const moment = require('moment');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' })); // Increase limit to 10MB for base64 images
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/adminpannel', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Error connecting to MongoDB:', err));

// User Schema and Model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String,
  confirmPassword: String,
  date: { type: Date, default: Date.now },
  image: String, // Store the base64 string of the image
});

const User = mongoose.model('users', userSchema);

// Get all users
app.get('/users', (req, res) => {
  User.find()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(err => res.status(500).send('Error retrieving users: ' + err));
});

// Add a new user
app.post('/adduser', (req, res) => {
  const { date, ...rest } = req.body;
  const formattedDate = moment.utc(date, 'YYYY-MM-DD').toDate();

  const newUser = new User({ ...rest, date: formattedDate });
  newUser.save()
    .then((savedUser) => res.status(201).json(savedUser))
    .catch((err) => res.status(500).send('Error adding user: ' + err));
});

// Update a user by ID
app.put('/edituser/:id', (req, res) => {
  const { id } = req.params;
  const { date, ...rest } = req.body;
  const formattedDate = date ? moment.utc(date, 'YYYY-MM-DD').toDate() : undefined;

  const updatedUserData = {
    ...rest,
    date: formattedDate,
  };

  User.findByIdAndUpdate(id, updatedUserData, { new: true })
    .then((updatedUser) => {
      if (updatedUser) {
        updatedUser.date = moment.utc(updatedUser.date).format('YYYY-MM-DD');
        res.status(200).json(updatedUser);
      } else {
        res.status(404).send('User not found');
      }
    })
    .catch((err) => res.status(500).send('Error updating user: ' + err));
});

// Delete a user by ID
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  User.findByIdAndDelete(id)
    .then(() => res.status(200).send('User deleted successfully'))
    .catch((err) => res.status(500).send('Error deleting user: ' + err));
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
