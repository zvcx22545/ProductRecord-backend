const express = require("express")
const product = require('../../controllers/product')

const router = express.Router()

router.get('/getProducts', product.getProductByType)
router.post('/createProduct', product.createProduct)
router.get('/image/:image', product.getImageProduct)
router.delete('/deleteProduct/:id', product.deleteProductById)
router.post('/update-Product', product.updateProducts)
router.post('/getProduct_ByProductID', product.getProductByProductID)
router.post('/getSuggestions', product.getSuggestions)



module.exports = router