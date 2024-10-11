// const express = require('express');
// const mongoose = require('mongoose');
// const fs = require('fs');
// const cors = require('cors');
// const multer = require('multer');
// const moment = require('moment');
// const path = require('path');

// const app = express();

// // Middleware
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ limit: '10mb', extended: true }));
// app.use(cors());

// // app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// // Connect to MongoDB
// mongoose.connect('mongodb://localhost:27017/adminpannel', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
//   .then(() => console.log('Connected to MongoDB'))
//   .catch((err) => console.log('Error connecting to MongoDB:', err));

// // User Schema and Model
// const userSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   phone: String,
//   password: String,
//   confirmPassword: String,
//   date: { type: Date, default: Date.now },
//   image: String, // Store the base64 string of the image or file path if using multer
// });

// const User = mongoose.model('users', userSchema);

// // Multer configuration for image upload
// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //     cb(null, 'uploads/'); // Destination folder
// //   },
// //   filename: (req, file, cb) => {
// //     // cb(null, Date.now() + path.extname(file.originalname)); // Appending file extension
// //     cb(null, Date.now() + '-' + file.originalname); // Generate a unique file name
// //   }
// // });
// const storage = multer.memoryStorage();

// const upload = multer({ storage });
// // const upload = multer({ storage: storage });
// // const upload = multer({ 
// //   limits: { fileSize: 25 * 1024 * 1024 }, // 5 MB limit
 
// // });


// // Get all users
// app.get('/users', async (req, res) => {
//   try {
//     const users = await User.find();
//     res.status(200).json(users);
//   } catch (err) {
//     res.status(500).send('Error retrieving users: ' + err);
//   }
// });


// // signin uploads image

// // Add a new user with image upload (via multer) and email/phone validation
// app.post('/api/users',upload.single('image'), async (req, res) => {

//   try {
//     const { email, phone, password, confirmPassword, ...userData } = req.body;

//     // Validation for email and phone
//     const emailExists = await User.findOne({ email });
//     if (emailExists) {
//       return res.status(400).json({ message: 'Email already exists' });
//     }

//     const phoneExists = await User.findOne({ phone });
//     if (phoneExists) {
//       return res.status(400).json({ message: 'Phone number already exists' });
//     }

//     if (password !== confirmPassword) {
//       return res.status(400).json({ message: 'Passwords do not match' });
//     }
//      // Handle image upload
//      let imagePath = null;
//      if (req.file) {
//        imagePath = req.file.path; // Save the file path to store in MongoDB
//      }

//     const newUser = new User({
//       ...userData,
//       email,
//       phone,
//       password,
//       confirmPassword,
//       image: imageUrl, // Add the image URL here

//     });

//     const savedUser = await newUser.save();
//     res.status(201).json(savedUser);
//   } catch (err) {
//     res.status(500).send('Error adding user: ' + err);
//   }
// });

// // Add a new user with an image (Multer upload)
// app.post('/adduser', upload.single('photo'), async (req, res) => {
//   try {
//     const { date, ...rest } = req.body;
//     const formattedDate = moment.utc(date, 'YYYY-MM-DD').toDate();

//     const newUser = new User({ ...rest, date: formattedDate, image: req.file.path });
//     const savedUser = await newUser.save();
//     res.status(201).json(savedUser);
//      res.send('User saved successfully');
//   } catch (err) {
//     console.error('Database error:', err); // Log the error
//     res.status(500).send('Error adding user: ' + err);
//   }
// });


// // Login API route
// app.post('/api/users/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Check if user exists by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: 'User not registered' });
//     }

//     // Check if the password matches
//     if (user.password !== password) {
//       return res.status(400).json({ message: 'Invalid email or password' });
//     }

//     // Success: return user data or a success message
//     res.status(200).json({ message: 'Login successful', user });
//   } catch (error) {
//     res.status(500).json({ message: 'Error logging in', error: error.message });
//   }
// });

// // Update a user by ID
// app.put('/edituser/:id', upload.single('photo'), async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { date, password, confirmPassword, ...rest } = req.body;

//     if (password && password !== confirmPassword) {
//       return res.status(400).json({ message: 'Passwords do not match' });
//     }

//     const formattedDate = date ? moment.utc(date, 'YYYY-MM-DD').toDate() : undefined;

//     const updatedUserData = {
//       ...rest,
//       date: formattedDate,
//       password: password || undefined,
//       image: req.file ? req.file.path : rest.image, // Update image if provided
//     };

//     const updatedUser = await User.findByIdAndUpdate(id, updatedUserData, { new: true });
//     if (updatedUser) {
//       updatedUser.date = moment.utc(updatedUser.date).format('YYYY-MM-DD');
//       res.status(200).json(updatedUser);
//     } else {
//       res.status(404).send('User not found');
//     }
//   } catch (err) {
//     res.status(500).send('Error updating user: ' + err);
//   }
// });

// // Delete a user by ID
// app.delete('/users/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     await User.findByIdAndDelete(id);
//     res.status(200).send('User deleted successfully');
//   } catch (err) {
//     res.status(500).send('Error deleting user: ' + err);
//   }
// });

// // Start the server
// const PORT = 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



// //////
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const moment = require('moment');

// Initialize app
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

// Multer configuration for storing the image in memory
const storage = multer.memoryStorage(); // Store files in memory as Buffer
const upload = multer({ storage });

// Get all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).send('Error retrieving users: ' + err);
  }
});

// Add a new user with base64 image upload
app.post('/api/users', upload.single('image'), async (req, res) => {
  try {
    const { email, phone, password, confirmPassword, ...userData } = req.body;

    // Check if email or phone number already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(400).json({ message: 'Phone number already exists' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Convert the image buffer to base64
    let imageBase64 = null;
    if (req.file) {
      imageBase64 = req.file.buffer.toString('base64'); // Convert image buffer to base64
    }

    const newUser = new User({
      ...userData,
      email,
      phone,
      password,
      confirmPassword,
      image: imageBase64, // Store the base64 string in MongoDB
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    console.error('Error adding user:', err); // Log the error
    res.status(500).send('Error adding user: ' + err);
  }
});

// // Add a new user with an image (Multer upload)
app.post('/adduser', upload.single('photo'), async (req, res) => {
  try {
    const { date, ...rest } = req.body;
    const formattedDate = moment.utc(date, 'YYYY-MM-DD').toDate();

    const newUser = new User({ ...rest, date: formattedDate, image: req.file.path });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
     res.send('User saved successfully');
  } catch (err) {
    console.error('Database error:', err); // Log the error
    res.status(500).send('Error adding user: ' + err);
  }
});

// Update a user by ID with base64 image
app.put('/edituser/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { date, password, confirmPassword, ...rest } = req.body;

    if (password && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const formattedDate = date ? moment.utc(date, 'YYYY-MM-DD').toDate() : undefined;

    // Convert the image buffer to base64 if an image is uploaded
    let imageBase64 = rest.image;
    if (req.file) {
      imageBase64 = req.file.buffer.toString('base64');
    }

    const updatedUserData = {
      ...rest,
      date: formattedDate,
      password: password || undefined,
      image: imageBase64, // Update image in base64 format if provided
    };

    const updatedUser = await User.findByIdAndUpdate(id, updatedUserData, { new: true });
    if (updatedUser) {
      updatedUser.date = moment.utc(updatedUser.date).format('YYYY-MM-DD');
      res.status(200).json(updatedUser);
    } else {
      res.status(404).send('User not found');
    }
  } catch (err) {
    console.error('Error updating user:', err); // Log the error
    res.status(500).send('Error updating user: ' + err);
  }
});
// Update a user by ID
app.put('/edituser/:id', upload.single('photo'), async (req, res) => {
  try {
    const { id } = req.params;
    const { date, password, confirmPassword, ...rest } = req.body;

    if (password && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const formattedDate = date ? moment.utc(date, 'YYYY-MM-DD').toDate() : undefined;

    const updatedUserData = {
      ...rest,
      date: formattedDate,
      password: password || undefined,
      image: req.file ? req.file.path : rest.image, // Update image if provided
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
