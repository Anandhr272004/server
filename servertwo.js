const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increase body size limit to accommodate base64 images

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ecommerce', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((error) => console.log('Error connecting to MongoDB:', error));

// Define Product Schema and Model
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    description: String,  // New description field
    imageBase64: String,  // Store the image as a base64 string
});

const Product = mongoose.model('Product', productSchema);

// Route to Add a Product
app.post('/api/products', async (req, res) => {
    const { name, price, description, imageBase64 } = req.body;

    try {
        const newProduct = new Product({ name, price, description, imageBase64 });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error adding product', error });
    }
});

// Route to Get All Products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error });
    }
});

// Route to Update a Product
app.put('/api/products/:id', async (req, res) => {
    const { name, price, description, imageBase64 } = req.body;
    
    try {
        // Find the product by ID and update it with the new data
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { name, price, description, imageBase64 },  // New product data
            { new: true }  // Return the updated document
        );
        
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(updatedProduct);  // Send the updated product as response
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error });
    }
});


const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
