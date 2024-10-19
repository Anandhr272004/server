// Import required libraries
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const moment = require('moment');

// Initialize app
const app = express();

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true })); 
app.use(cors());  

mongoose.connect('mongodb://localhost:27017/userlogin', {
  useNewUrlParser: true,
  useUnifiedTopology: true, 
})
  .then(() => console.log('Connected to MongoDB')) 
  .catch((err) => console.log('Error connecting to MongoDB:', err)); 

// Define the user schema and model for MongoDB
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String,
  confirmPassword: String,
  date: { type: Date, default: Date.now },
  image: String,  
});

// Create the User model (MongoDB collection will be named 'users')
const User = mongoose.model('login', userSchema);

// Configure Multer to store uploaded files in memory (as a buffer)
const storage = multer.memoryStorage();  // Storing files in memory
const upload = multer({ storage });  // Setting up Multer with memory storage

// Route to get all users from the database
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();  // Retrieve all users
    res.status(200).json(users);  // Send the users as JSON
  } catch (err) {
    res.status(500).send('Error retrieving users: ' + err); 
  }
});

// Route to add a new user with an image (stored as base64)
app.post('/api/users', upload.single('image'), async (req, res) => {
  try {
    const { email, phone, password, confirmPassword, ...userData } = req.body;

    // Check if email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Check if phone number already exists
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(400).json({ message: 'Phone number already exists' });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Convert the uploaded image to base64
    let imageBase64 = null;
    if (req.file) {
      imageBase64 = req.file.buffer.toString('base64');  // Convert image buffer to base64 string
    }

    // Create a new user
    const newUser = new User({
      ...userData,
      email,
      phone,
      password,
      confirmPassword,
      image: imageBase64,  
    });

    const savedUser = await newUser.save();  // Save the user to the database
    res.status(201).json(savedUser);  // Respond with the saved user
  } catch (err) {
    console.error('Error adding user:', err);  // Log error if something goes wrong
    res.status(500).send('Error adding user: ' + err);  // Error message to client
  }
});

// Login API route for user authentication
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not registered' });
    }

    // Check if the provided password matches the user's password
    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Login successful
    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });  // Handle login error
  }
});

// Add a new user with an image (image stored in file path)
app.post('/adduser', upload.single('photo'), async (req, res) => {
  try {
    const { date, ...rest } = req.body;
    const formattedDate = moment.utc(date, 'YYYY-MM-DD').toDate();  // Format the date from input

    const newUser = new User({ ...rest, date: formattedDate, image: req.file.path });  // Store the image path
    const savedUser = await newUser.save();  // Save user to the database
    res.status(201).json(savedUser);
    res.send('User saved successfully');
  } catch (err) {
    console.error('Database error:', err);  // Log the error
    res.status(500).send('Error adding user: ' + err);
  }
});

// Update a user by ID (with base64 image support)
app.put('/edituser/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { date, password, confirmPassword, ...rest } = req.body;

    // Check if passwords match during update
    if (password && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const formattedDate = date ? moment.utc(date, 'YYYY-MM-DD').toDate() : undefined;  // Format date

    // Handle image update (convert to base64)
    let imageBase64 = rest.image;
    if (req.file) {
      imageBase64 = req.file.buffer.toString('base64');
    }

    const updatedUserData = {
      ...rest,
      date: formattedDate,
      password: password || undefined,
      image: imageBase64, 
    };

    // Update the user in the database
    const updatedUser = await User.findByIdAndUpdate(id, updatedUserData, { new: true });
    if (updatedUser) {
      updatedUser.date = moment.utc(updatedUser.date).format('YYYY-MM-DD');  // Format the date for response
      res.status(200).json(updatedUser);  // Send updated user data
    } else {
      res.status(404).send('User not found');  // Handle case where user is not found
    }
  } catch (err) {
    console.error('Error updating user:', err);  // Log the error
    res.status(500).send('Error updating user: ' + err);  // Error message to client
  }
});

// Delete a user by ID
app.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);  // Delete the user from the database
    res.status(200).send('User deleted successfully');
  } catch (err) {
    res.status(500).send('Error deleting user: ' + err);  // Handle deletion error
  }
});

// Start the server on port 5000
const PORT = 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));  // Log server startup
