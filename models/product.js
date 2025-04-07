// models/Product.js
// This is a wrapper around Prisma for any additional model logic
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class Product {
    static async findAll() {
        return prisma.product.findMany({
            include: {
                user: true
            }
        });
    }
    
    static async findById(id) {
        return prisma.product.findUnique({
            where: {
                id: parseInt(id)
            },
            include: {
                user: true
            }
        });
    }
    
    static async create(data) {
        return prisma.product.create({
            data: {
                ...data,
                create_date: new Date(),
                update_date: new Date()
            }
        });
    }
    
    static async update(id, data) {
        return prisma.product.update({
            where: {
                id: parseInt(id)
            },
            data: {
                ...data,
                update_date: new Date()
            }
        });
    }
    
    static async delete(id) {
        return prisma.product.delete({
            where: {
                id: parseInt(id)
            }
        });
    }
}

module.exports = Product;