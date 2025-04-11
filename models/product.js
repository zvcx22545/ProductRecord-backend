// models/Product.js
// This is a wrapper around Prisma for any additional model logic
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = { 
    getUserUsedByID,
    getProductByType,
    getProductByID,
    deleteProduct,
    getProductByProductID,
}

async function getUserUsedByID(userID) {
    const user = await prisma.user.findMany({
        where: {
            user_id: userID
        }
    });
    return user;
}

async function getProductByType (ProductType) {
    const row = await prisma.product.findMany({
          where: {
            product_type: Array.isArray(ProductType)
                ? { in: ProductType }
                : ProductType
        },
        orderBy: {
            id: 'asc'  // เรียงจาก id ที่ใหญ่ที่สุดไปหาน้อยที่สุด
          }
    });
    return row;
}

async function getProductByID (id) {
    const row = await prisma.product.findMany({
        where: {
            id: id
        }
    });
    return row;
}
async function getProductByProductID (product_id) {
    const row = await prisma.product.findMany({
        where: {
            product_id: product_id
        }
    });
    return row;
}

async function deleteProduct (productID) {
    try {
        const deletedProduct = await prisma.product.delete({
            where: {
                id: productID
            }
        });

        return { success: true, deletedProduct };
    } catch (error) {
        console.error('Error deleting product:', error);
        return { success: false, message: 'Failed to delete product', error: error.message };
    }
}