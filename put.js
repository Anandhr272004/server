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

// PUT route to update an existing item by ID
app.put('/update-item/:id', (req, res) => {
  const itemId = req.params.id; // Get the item ID from the request parameters

  // Find the item by ID and update its name and price
  Item.findByIdAndUpdate(itemId, {
    name: req.body.name,
    price: req.body.price,
  }, { new: true }) // { new: true } returns the updated item
    .then((updatedItem) => {
      if (!updatedItem) {
        return res.status(404).send('Item not found');
      }
      res.json(updatedItem); // Send back the updated item
    })
    .catch((err) => {
      res.status(500).send('Error updating item: ' + err);
    });
});

// Start the server on port 3001
app.listen(3003, () => {
  console.log('Server is running on port 3003');
});
