const express = require("express")
const product = require('../../controllers/product')

const router = express.Router()

router.get('/getProducts/:productType', product.getProductByType)
router.post('/createProduct', product.createProduct)
router.get('/image/:image', product.getImageProduct)
router.delete('/:id', product.deleteProduct)

module.exports = router