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




// using multer
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const multer = require('multer');
// const moment = require('moment');
// const path = require('path');
// const fs = require('fs');

// const app = express();

// // Middleware
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ limit: '10mb', extended: true }));
// app.use(cors());

// // Connect to MongoDB
// mongoose.connect('mongodb://localhost:27017/adminpanel', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => console.log('Connected to MongoDB'))
//   .catch(err => console.log('Error connecting to MongoDB:', err));

// // Multer Storage Configuration for Images
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const dir = 'uploads/';
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir);
//     }
//     cb(null, dir); // Save the uploaded images in 'uploads' folder
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, uniqueSuffix + path.extname(file.originalname)); // Save file with unique timestamp name
//   }
// });

// // File upload restrictions: Only images, max size 10MB
// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB size limit
//   fileFilter: (req, file, cb) => {
//     const fileTypes = /jpeg|jpg|png/; // Allowed file types
//     const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
//     const mimeType = fileTypes.test(file.mimetype);
    
//     if (extname && mimeType) {
//       return cb(null, true);
//     } else {
//       cb(new Error('Only images (jpeg, jpg, png) are allowed!'));
//     }
//   }
// });

// // User Schema and Model
// const userSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   phone: String,
//   password: String,
//   confirmPassword: String,
//   date: { type: Date, default: Date.now },
//   image: String, // Store the image file path
// });

// const User = mongoose.model('users', userSchema);

// // Get all users
// app.get('/users', async (req, res) => {
//   try {
//     const users = await User.find();
//     res.status(200).json(users);
//   } catch (err) {
//     res.status(500).send('Error retrieving users: ' + err);
//   }
// });

// // Add a new user with image upload
// app.post('/adduser', upload.single('image'), async (req, res) => {
//   try {
//     const { date, ...rest } = req.body;
//     const formattedDate = moment.utc(date, 'YYYY-MM-DD').toDate();

//     const imagePath = req.file ? req.file.path : ''; // Get the uploaded file path
    
//     const newUser = new User({
//       ...rest,
//       date: formattedDate,
//       image: imagePath // Store the image file path
//     });

//     const savedUser = await newUser.save();
//     res.status(201).json(savedUser);
//   } catch (err) {
//     res.status(500).send('Error adding user: ' + err);
//   }
// });

// // Update a user by ID, including updating image
// app.put('/edituser/:id', upload.single('image'), async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { date, ...rest } = req.body;
//     const formattedDate = date ? moment.utc(date, 'YYYY-MM-DD').toDate() : undefined;

//     let updatedUserData = {
//       ...rest,
//       date: formattedDate,
//     };

//     if (req.file) {
//       updatedUserData.image = req.file.path; // Update image if new one is uploaded
//     }

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
//     const user = await User.findByIdAndDelete(id);
//     if (user && user.image) {
//       fs.unlinkSync(user.image); // Delete the image file if it exists
//     }
//     res.status(200).send('User deleted successfully');
//   } catch (err) {
//     res.status(500).send('Error deleting user: ' + err);
//   }
// });

// // Serve static files for images
// app.use('/uploads', express.static('uploads'));

// // Start the server
// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
