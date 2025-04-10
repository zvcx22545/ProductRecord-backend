// models/Product.js
// This is a wrapper around Prisma for any additional model logic
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = { 
    getUserUsedByID,
    getProductByType
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
        }
    });
    return row;
}
    

