const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
module.exports = {
    createUser
}
// create user
async function createUser(data) {
    return await prisma.user.create({
        data : data
    })
}

