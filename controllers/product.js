// controllers/product.js
const multer = require('multer')
const fs = require("fs")
const dayjs = require('dayjs')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const ctrl = {}

// Set up multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userid = req.body.user_id;
        const uploadPath = `upload/user/${userid}`;

        // Check if user folder exists, create if not
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Upload only JPG, PNG, and SVG are allowed"));
    }
};

const upload = multer({ storage, fileFilter });

// Get all products
ctrl.getAllProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: {
                user: true
            }
        });
        
        return res.status(200).json({
            status: 'success',
            data: products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch products',
            error: error.message
        });
    }
};

// Get product by ID
ctrl.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const product = await prisma.product.findUnique({
            where: {
                id: parseInt(id)
            },
            include: {
                user: true
            }
        });
        
        if (!product) {
            return res.status(404).json({
                status: 'error',
                message: 'Product not found'
            });
        }
        
        return res.status(200).json({
            status: 'success',
            data: product
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch product',
            error: error.message
        });
    }
};

// Create new product with file upload
ctrl.createProduct = async (req, res) => {
    try {
        const uploadMiddleware = upload.single('image');
        
        uploadMiddleware(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    status: 'error',
                    message: err.message
                });
            }
            
            const {
                product_name,
                user_used,
                product_id,
                price,
                department,
                product_type,
                add_by_user
            } = req.body;
            
            // Image file path if uploaded
            const imagePath = req.file ? `${req.file.destination}/${req.file.filename}` : null;
            let create_date = dayjs().toISOString()
            let update_date = dayjs().toISOString()
            
            const newProduct = await prisma.product.create({
                data: {
                    product_name,
                    user_used,
                    product_id,
                    price,
                    department,
                    product_type,
                    image: imagePath,
                    add_by_user,
                    create_date: create_date,
                    update_date: update_date,
                }
            });
            
            return res.status(201).json({
                status: 'success',
                message: 'Product created successfully',
                data: newProduct
            });
        });
    } catch (error) {
        console.error('Error creating product:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to create product',
            error: error.message
        });
    }
};

// Update product
ctrl.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const uploadMiddleware = upload.single('image');
        
        uploadMiddleware(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    status: 'error',
                    message: err.message
                });
            }
            
            const {
                product_name,
                user_used,
                product_id,
                price,
                department,
                product_type
            } = req.body;
            
            // Get current product to check if there's an existing image
            const currentProduct = await prisma.product.findUnique({
                where: {
                    id: parseInt(id)
                }
            });
            
            if (!currentProduct) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Product not found'
                });
            }
            
            // If a new file is uploaded, use it; otherwise, keep the existing image
            const imagePath = req.file 
                ? `${req.file.destination}/${req.file.filename}`
                : currentProduct.image;
            
            // Delete old image if new one is uploaded
            if (req.file && currentProduct.image) {
                try {
                    fs.unlinkSync(currentProduct.image);
                } catch (unlinkError) {
                    console.error('Failed to delete old image:', unlinkError);
                }
            }
            
            const updatedProduct = await prisma.product.update({
                where: {
                    id: parseInt(id)
                },
                data: {
                    product_name,
                    user_used,
                    product_id,
                    price,
                    department,
                    product_type,
                    image: imagePath,
                    update_date: new Date()
                }
            });
            
            return res.status(200).json({
                status: 'success',
                message: 'Product updated successfully',
                data: updatedProduct
            });
        });
    } catch (error) {
        console.error('Error updating product:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to update product',
            error: error.message
        });
    }
};

// Delete product
ctrl.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get current product to delete image if exists
        const product = await prisma.product.findUnique({
            where: {
                id: parseInt(id)
            }
        });
        
        if (!product) {
            return res.status(404).json({
                status: 'error',
                message: 'Product not found'
            });
        }
        
        // Delete image file if exists
        if (product.image) {
            try {
                fs.unlinkSync(product.image);
            } catch (unlinkError) {
                console.error('Failed to delete image:', unlinkError);
            }
        }
        
        // Delete product from database
        await prisma.product.delete({
            where: {
                id: parseInt(id)
            }
        });
        
        return res.status(200).json({
            status: 'success',
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to delete product',
            error: error.message
        });
    }
};

module.exports = ctrl;