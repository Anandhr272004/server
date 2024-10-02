const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const moment = require('moment');
const path = require('path');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
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
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).send('Error retrieving users: ' + err);
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Destination folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
  }
});

const upload = multer({ storage });

// Add a new user
app.post('/adduser', upload.single('photo'), async (req, res) => {
  try {
    const { date, ...rest } = req.body;
    const formattedDate = moment.utc(date, 'YYYY-MM-DD').toDate();

    const newUser = new User({ ...rest, date: formattedDate });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).send('Error adding user: ' + err);
  }
});

// New API route for sign-up (add this to your existing backend code)
app.post('/signup', async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate that password and confirmPassword match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Create a new user object
    const newUser = new User({
      name,
      email,
      phone,
      password,  // Ideally, password should be hashed before saving in production
      confirmPassword,
    });

    // Save the user to the database
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).send('Error registering user: ' + err);
  }
});

// Update a user by ID
app.put('/edituser/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, ...rest } = req.body;
    const formattedDate = date ? moment.utc(date, 'YYYY-MM-DD').toDate() : undefined;

    const updatedUserData = {
      ...rest,
      date: formattedDate,
    };

    const updatedUser = await User.findByIdAndUpdate(id, updatedUserData, { new: true });
    if (updatedUser) {
      updatedUser.date = moment.utc(updatedUser.date).format('YYYY-MM-DD');
      res.status(200).json(updatedUser);
    } else {
      res.status(404).send('User not found');
    }
  } catch (err) {
    res.status(500).send('Error updating user: ' + err);
  }
});

// Delete a user by ID
app.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).send('User deleted successfully');
  } catch (err) {
    res.status(500).send('Error deleting user: ' + err);
  }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


