// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');

// // Create Express App
// const app = express();
// app.use(express.json());
// app.use(cors()); // Enable CORS for all origins

// // MongoDB connection
// mongoose.connect('mongodb://localhost:27017/userdata', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.log('Error connecting to MongoDB:', err));

// // User Schema
// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   phone: { type: String, required: true, unique: true },
//   password: { type: String, required: true }
// });

// const User = mongoose.model('User', userSchema);

// // Register new user
// app.post('/register', async (req, res) => {
//   try {
//     const { name, email, phone, password } = req.body;

//     // Check if email or phone already exists
//     const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
//     if (existingUser) {
//       return res.status(400).json({ message: 'Email or Phone already exists' });
//     }

//     // Create and save the new user
//     const newUser = new User({ name, email, phone, password });
//     await newUser.save();

//     res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
//   } catch (error) {
//     res.status(500).json({ message: 'Error registering user', error: error.message });
//   }
// });

// app.get('/user/:userId', async (req, res) => {
//     const { userId } = req.params;
//     try {
//       const user = await User.findById(userId);
//       if (!user) {
//         return res.status(404).json({ message: 'User not found' });
//       }
//       res.json(user);
//     } catch (error) {
//       res.status(500).json({ message: 'Error fetching user details' });
//     }
//   });
  

// // Update user details
// app.put('/user/:id', async (req, res) => {
//   try {
//     const { name, email, phone, password } = req.body;

//     // Check if email or phone already exists for other users
//     const existingUser = await User.findOne({
//       $or: [{ email }, { phone }],
//       _id: { $ne: req.params.id } // Ensure it's not the same user being updated
//     });
//     if (existingUser) {
//       return res.status(400).json({ message: 'Email or Phone already exists' });
//     }

//     // Find the user by ID and update their details
//     const updatedUser = await User.findByIdAndUpdate(
//       req.params.id,
//       { name, email, phone, password },
//       { new: true, runValidators: true } // Return updated user and validate changes
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.json({ message: 'User updated successfully', user: updatedUser });
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating user', error: error.message });
//   }
// });

// // Delete user by ID
// app.delete('/user/:id', async (req, res) => {
//   try {
//     const deletedUser = await User.findByIdAndDelete(req.params.id);

//     if (!deletedUser) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.json({ message: 'User deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error deleting user', error: error.message });
//   }
// });

// // Start the server
// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });




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
