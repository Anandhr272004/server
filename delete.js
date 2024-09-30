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

// DELETE route to remove an item by ID
app.delete('/delete-item/:id', (req, res) => {
  const itemId = req.params.id; // Get the item ID from the request parameters

  // Find the item by ID and delete it
  Item.findByIdAndDelete(itemId)
    .then((deletedItem) => {
      if (!deletedItem) {
        return res.status(404).send('Item not found');
      }
      res.send('Item deleted successfully!');
    })
    .catch((err) => {
      res.status(500).send('Error deleting item: ' + err);
    });
});

// Start the server on port 3001
app.listen(3004, () => {
  console.log('Server is running on port 3004');
});
