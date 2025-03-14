const path = require("path");
const Product = require("../Models/ProductSchema");

exports.addProduct = async (req, res) => {
    try {
        const { image, name, description, category, price_per_lb, sizes, rating } = req.body;

        if (!image || !name || !description || !category || !price_per_lb || !sizes) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const newProduct = new Product({
            image,
            name,
            description,
            category,
            price_per_lb: parseFloat(price_per_lb),
            sizes,
            rating: parseInt(rating) || 5,
        });

        console.log("New Product Details:", newProduct);

        // Save to the database
        await newProduct.save();

        // Respond with success message
        res.status(201).json({ message: 'Product added successfully!' });
    } catch (err) {
        console.error("Error adding product:", err);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        
        console.log('call--products ' ,  products);
        

        if (!products || products.length === 0) {
            return res.status(404).json({ message: "No products found." });
        }

        res.status(200).json({ products });
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
};

exports.editProduct = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(req.body.price_per_lb);

        const { image, name, description, category, price_per_lb, sizes, rating } = req.body;

        if (!image || !name || !description || !category || !price_per_lb || !sizes) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            {
                image,
                name,
                description,
                category,
                price_per_lb,
                sizes,
                rating: parseInt(rating) || 5,
            },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        res.status(200).json({ message: 'Product updated successfully!', product: updatedProduct });
    } catch (err) {
        console.error("Error editing product:", err);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};
