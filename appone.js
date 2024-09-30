// Import express and mongoose
const express = require('express');
const mongoose = require('mongoose');

// Create an Express app
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/connect', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => {
  console.log('Error connecting to MongoDB:', err);
});

// Create a simple route
app.get('/', (req, res) => {
  res.send('Hello, MongoDB is connected!');
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
