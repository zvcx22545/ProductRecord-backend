// controllers/product.js
const cloudinary = require("../utils/cloudinary")
const upload = require("../utils/multer")
const fs = require("fs")
const path = require('path')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const ctrl = {}
const modelProduct = require('../models/product')
const stream = require('stream')

dayjs.extend(utc)
dayjs.extend(timezone)

// Get all products
ctrl.getAllProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: {
                user: true
            }
        })

        return res.status(200).json({
            status: 'success',
            data: products
        })
    } catch (error) {
        console.error('Error fetching products:', error)
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch products',
            error: error.message
        })
    }
}

// Create new product with file upload
ctrl.createProduct = async (req, res) => {
    try {
        const uploadMiddleware = upload.single('image')

        uploadMiddleware(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    status: 'error',
                    message: err.message
                })
            }

            const {
                product_name,
                employee_name,
                employee_ID,
                product_id,
                product_price,
                product_number,
                product_department,
                product_type,
                calendar,
                add_by_user
            } = req.body

            let price = parseInt(product_price)
            let product_num = parseInt(product_number)
            console.log('check calendar', calendar)
            const ckproduct = await modelProduct.getProductByProductID(product_id).then(row => row[0])

            if (ckproduct) {
                return res.status(400).json({
                    status: 'error',
                    message: 'มีเลขสินทรัพย์นนี้อยู่ในระบบแล้ว'
                })
            }
            console.log('req.file', req.file)
            if (!req.file) {
                return res.status(400).json({
                    status: 'error',
                    message: 'กรุณาอัพโหลดรูปภาพ'
                })
            }
            // อัปโหลดไปยัง Cloudinary
            const bufferStream = new stream.PassThrough()
            bufferStream.end(req.file.buffer)

            const uploadFromBuffer = () => {
                return new Promise((resolve, reject) => {
                    const cloudinaryStream = cloudinary.uploader.upload_stream(
                        { folder: 'product-images' }, // ตำแหน่งจัดเก็บ
                        (error, result) => {
                            if (error) return reject(error)
                            resolve(result)
                        }
                    )
                    bufferStream.pipe(cloudinaryStream)
                })
            }

            let imageUrl = null
            if (req.file) {
                const result = await uploadFromBuffer()
                imageUrl = result.secure_url
                imagePublicId = result.public_id
            }

            // Image file path if uploaded
            // const imagePath = req.file ? `${req.file.destination}/${req.file.filename}` : null
            const currentBangkokTime = dayjs().tz("Asia/Bangkok").toDate()

            const newProduct = await prisma.product.create({
                data: {
                    product_name,
                    user_used: employee_name,
                    product_id,
                    price: price,
                    department: product_department,
                    product_type,
                    image: imageUrl,
                    add_by_user,
                    create_date: calendar,
                    update_date: currentBangkokTime,
                    user_used_id: employee_ID,
                    image_public_id: imagePublicId,
                    product_num: product_num,
                }
            })

            return res.status(201).json({
                status: 'success',
                message: 'Product created successfully',
                data: newProduct
            })
        })
    } catch (error) {
        console.error('Error creating product:', error)
        return res.status(500).json({
            status: 'error',
            message: 'Failed to create product',
            error: error.message
        })
    }
}


// Delete product
ctrl.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params

        // Get current product to delete image if exists
        const product = await prisma.product.findUnique({
            where: {
                id: parseInt(id)
            }
        })

        if (!product) {
            return res.status(404).json({
                status: 'error',
                message: 'Product not found'
            })
        }

        // Delete image file if exists
        if (product.image) {
            try {
                fs.unlinkSync(product.image)
            } catch (unlinkError) {
                console.error('Failed to delete image:', unlinkError)
            }
        }

        // Delete product from database
        await prisma.product.delete({
            where: {
                id: parseInt(id)
            }
        })

        return res.status(200).json({
            status: 'success',
            message: 'Product deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting product:', error)
        return res.status(500).json({
            status: 'error',
            message: 'Failed to delete product',
            error: error.message
        })
    }
}

ctrl.getProductByType = async (req, res) => {
    try {
        const productType = req.query.productType
        const productTypeArray = Array.isArray(productType)
            ? productType
            : typeof productType === 'string'
                ? productType.split(',') // เช่น ?productType=ZZ,SV
                : []
        const product = await modelProduct.getProductByType(productTypeArray)

        res.send({
            status: 'success',
            product
        })
    } catch (error) {
        console.error('Error fetching product:', error)
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch product',
            error: error.message
        })
    }
}

ctrl.getImageProduct = async (req, res) => {
    try {
        const imageName = req.params.image
        const imagePath = path.join('upload', 'product', imageName)

        // Check if the file exists
        if (fs.existsSync(imagePath)) {
            // The file will be served by the static middleware
            // Just redirect to the correct static URL
            res.redirect(`/upload/product/${imageName}`)
        } else {
            res.status(404).json({
                status: 'error',
                message: 'Image not found'
            })
        }
    } catch (error) {
        console.error('Error retrieving image:', error)
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve image',
            error: error.message
        })
    }
}


ctrl.updateProducts = async (req, res) => {
    try {
        const products = req.body.products
        // Get current time in UTC+7 (Thailand Time)
        const currentTimeInTz = dayjs().tz('Asia/Bangkok').format()  // Adjust this format as needed
        // ใช้ Promise.all เพื่ออัพเดทแต่ละรายการ
        const updatedProducts = await Promise.all(products.map(product => {
            const product_number = parseInt(product.product_number)

            return prisma.product.update({
                where: { id: product.id },  // ใช้ id เพื่อระบุแถวที่ต้องการอัพเดท
                data: {
                    product_name: product.product_name,
                    user_used: product.user_used,
                    product_id: product.product_id,
                    price: product.price,
                    product_num: product_number,
                    department: product.department,
                    product_type: product.product_type,
                    add_by_user: product.add_by_user,
                    update_date: currentTimeInTz,  // Set update_date to current time in UTC+7
                    create_date: product.create_date,
                },
            })
        }))

        console.log('Updated products:', updatedProducts)
        res.status(200).json({ status: 'success', updatedProducts })
    } catch (error) {
        console.error('Error updating products:', error)
        res.status(500).json({
            status: 'error',
            message: 'Failed to update products',
            error: error.message
        })
    }
}

ctrl.deleteProductById = async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const ckproduct = await modelProduct.getProductByID(id).then(row => row[0])
        if (!ckproduct) {
            res.status(404).json({
                status: 'error',
                message: 'Product not found'
            })
            return
        }
        // 🔥 ลบรูปจาก Cloudinary
        if (ckproduct.image_public_id) {
            try {
                await cloudinary.uploader.destroy(ckproduct.image_public_id)
                console.log('ลบรูปจาก Cloudinary สำเร็จ:', ckproduct.image_public_id)
            } catch (cloudErr) {
                console.error('เกิดข้อผิดพลาดตอนลบรูป:', cloudErr)
            }
        }
        if (ckproduct.id) {
            await modelProduct.deleteProduct(id)
        }
        res.status(200).json({
            status: 'success',
            message: 'Product deleted successfully'
        })
    } catch (error) {
        console.log('error to delete product', error)
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete product',
            error: error.message
        })
    }
}

ctrl.getProductByProductID = async (req, res) => {
    try {
        const { product_id } = req.body;

        if (!product_id) {
            return res.status(400).json({
                status: 'error',
                message: 'กรุณาระบุ product_id',
            });
        }

        const product = await modelProduct.getProductByProductID(product_id)
        if (!product) {
            return res.status(404).json({
                status: 'error',
                message: 'ไม่พบสินทรัพย์',
            });
        }

        res.send({
            status: 'success',
            product,
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to get product',
            error: error.message
        })
    }
}
ctrl.getProductBySearch = async (req, res) => {
    const { query } = req.body;

    try {
        console.log('query ==>', query)
        if (!query || query.trim() === '') {
            return res.status(400).json({
                status: 'error',
                message: 'ไม่สามารถค้นหาได้กรุณากรอกชื่อ หรือ รหัสสินทรัพย์'
            });
        }

        const product = await prisma.product.findMany({
            where: {
                OR: [
                    { product_id: { contains: query, mode: 'insensitive' } },
                    { product_name: { contains: query, mode: 'insensitive' } }
                ]
            },
            orderBy: { product_id: 'asc' }
        });

        return res.send({ status: 'success', product });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
}

ctrl.getSuggestions = async (req, res) => {
    try {
        const { query } = req.body;
        console.log('check query', query)


        if (!query || query.length < 1) {
            return res.status(200).json({
                status: 'success',
                suggestions: []
            });
        }

        const suggestions = await modelProduct.getSuggestions(query);

        return res.status(200).json({
            status: 'success',
            suggestions
        });
    } catch (error) {
        console.error('Error in getSuggestions:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to get suggestions',
            error: error.message
        });
    }
}

module.exports = ctrl

