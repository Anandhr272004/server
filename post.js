// Import express, mongoose, and body-parser
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Create an Express app
const app = express();

// Use body-parser to handle data sent in requests
app.use(bodyParser.json()); // This allows us to read JSON data sent to our app

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

// Create a schema (structure) for the data we want to save
const itemSchema = new mongoose.Schema({
  name: String,
  price: Number,
});

// Create a model based on the schema
const Item = mongoose.model('Item', itemSchema);

// Route to create a new item (the Create operation)
app.post('/add-item', (req, res) => {
  // Create a new item using the data sent by the user
  const newItem = new Item({
    name: req.body.name,
    price: req.body.price,
  });

  // Save the item to the database
  newItem.save()
    .then(() => {
      res.send('Item added successfully!');
    })
    .catch((err) => {
      res.send('Error adding item: ' + err);
    });
});

// Start the server
app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
