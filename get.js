// Import express, mongoose, and body-parser (same as before)
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Create an Express app
const app = express();

// Use body-parser to handle JSON data
app.use(bodyParser.json());

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

// Create the schema and model for items (same as before)
const itemSchema = new mongoose.Schema({
  name: String,
  price: Number,
});

const Item = mongoose.model('Item', itemSchema);

// Create a GET route to fetch all items from MongoDB
app.get('/items', (req, res) => {
  // Find all items in the database
  Item.find()
    .then((items) => {
      res.json(items); // Send the items as a JSON response
    })
    .catch((err) => {
      res.status(500).json({ message: 'Error fetching items', error: err });
    });
});

// Start the server on port 3001
app.listen(3002, () => {
  console.log('Server is running on port 3002');
});
