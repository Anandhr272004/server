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
  image: String, // Store the base64 string of the image or file path if using multer
});

const User = mongoose.model('users', userSchema);

// Multer configuration for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Destination folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Appending file extension
  }
});

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


// signin uploads image

// Add a new user with image upload (via multer) and email/phone validation
app.post('/api/users',upload.single('image'), async (req, res) => {
  try {
    const { email, phone, password, confirmPassword, ...userData } = req.body;

    // Validation for email and phone
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
     // Handle image upload
     let imagePath = null;
     if (req.file) {
       imagePath = req.file.path; // Save the file path to store in MongoDB
     }

    const newUser = new User({
      ...userData,
      email,
      phone,
      password,
      confirmPassword,
      image: imagePath, // Store the image file path in the user record

    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).send('Error adding user: ' + err);
  }
});

// Add a new user with an image (Multer upload)
app.post('/adduser', upload.single('photo'), async (req, res) => {
  try {
    const { date, ...rest } = req.body;
    const formattedDate = moment.utc(date, 'YYYY-MM-DD').toDate();

    const newUser = new User({ ...rest, date: formattedDate, image: req.file.path });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).send('Error adding user: ' + err);
  }
});

// Fetch all users
app.get('/api/allusers', async (req, res) => {
  try {
    const result = await User.find();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Fetch a single user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// Login API route
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not registered' });
    }

    // Check if the password matches
    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Success: return user data or a success message
    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
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


// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const multer = require('multer');
// const moment = require('moment');
// const path = require('path');
// const fs = require('fs');
// const bcrypt = require('bcrypt'); // For password hashing

// const app = express();

// // Middleware
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ limit: '10mb', extended: true }));
// app.use(cors());

// // Serve static files for the 'uploads' directory
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadPath = 'uploads/';
//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath, { recursive: true });
//     }
//     cb(null, uploadPath); // Destination folder
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); // Appending file extension
//   }
// });

// const upload = multer({ storage });

// // Password hashing function
// const hashPassword = async (password) => {
//   const saltRounds = 10;
//   return await bcrypt.hash(password, saltRounds);
// };

// // Verify password
// const verifyPassword = async (password, hashedPassword) => {
//   return await bcrypt.compare(password, hashedPassword);
// };

// // Get all users
// app.get('/users', async (req, res) => {
//   try {
//     const users = await User.find();
//     res.status(200).json(users);
//   } catch (err) {
//     res.status(500).send('Error retrieving users: ' + err);
//   }
// });

// // Sign up and upload an image
// app.post('/api/users', upload.single('image'), async (req, res) => {
//   console.log('Request body:', req.body); // Log the request body
//   console.log('Uploaded file:', req.file); // Log the uploaded file information
//   try {
//     const { email, phone, password, confirmPassword, ...userData } = req.body;

//     // Check if email or phone already exists
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

//     // Hash the password before saving
//     const hashedPassword = await hashPassword(password);

//     // Handle image upload
//     let imagePath = null;
//     if (req.file) {
//       imagePath = req.file.path; // Save the file path to store in MongoDB
//     }

//     const newUser = new User({
//       ...userData,
//       email,
//       phone,
//       password: hashedPassword,
//       confirmPassword: hashedPassword, // Save hashed passwords
//       image: imagePath // Store the image file path in the user record
//     });

//     const savedUser = await newUser.save();
//     res.status(201).json(savedUser);
//   } catch (err) {
//     console.error('Error adding user:', err);
//     return res.status(500).send({ message: 'Error adding user', error: err.message });
//   }
//   // catch (err) {
//   //   res.status(500).send('Error adding user: ' + err);
//   // }
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
//     const isPasswordValid = await verifyPassword(password, user.password);
//     if (!isPasswordValid) {
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

//     let hashedPassword = undefined;
//     if (password) {
//       hashedPassword = await hashPassword(password);
//     }

//     const formattedDate = date ? moment.utc(date, 'YYYY-MM-DD').toDate() : undefined;

//     const updatedUserData = {
//       ...rest,
//       date: formattedDate,
//       password: hashedPassword || undefined,
//       image: req.file ? req.file.path : rest.image // Update image if provided
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

