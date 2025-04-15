const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
module.exports = {
    createUser,
    getUserById,
    updateUserById
}
const dayjs = require('dayjs');
// create user
async function createUser(data) {
    try {
      const currentDate = dayjs().toISOString();
  
      if (!data.password || !data.role || !data.user_id) {
        throw new Error("Username, password, and role are required fields.");
      }
  
      const newUser = await prisma.user.create({
        data: {
          user_id: data.user_id, // Make sure user_id is an integer
          first_name: data.first_name || null,
          last_name: data.last_name || null,
          department: data.department, // Assuming username is department for now
          position: data.position || null,
          role: data.role,
          password: data.password, // Assuming the password is already hashed
          profile_image: data.profile_image || null, // Allow optional profile_image
          create_date: currentDate, 
          update_date: currentDate, 
        }
      });
  
      return newUser;
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error(error.message || "An error occurred while creating the user.");
    }
  }

async function getUserById(userId) {
    try {
      console.log('check userId ,', userId)
        const user = await prisma.user.findUnique({
            where: {
                user_id:userId
            }
        })

          return user
    } catch (e) {
        console.error("Error fetching user by ID:", e);
        throw new Error(e.message || "An error occurred while fetching the user.");
    } 
  }

async function updateUserById(data, profile_image, imagePublicId) {
    try {
      console.log('check data', data)
      console.log('check profile_image', profile_image)
         const currentDate = dayjs().tz('Asia/Bangkok').format()
      const id = parseInt(data.id, 10)
        const updatedUser = await prisma.user.update({
            where: {
              id: id
            },
            data: {
                first_name: data.first_name || null,
                last_name: data.last_name || null,
                department: data.department, // Assuming username is department for now
                position: data.position || null,
                profile_image: profile_image || null, // Allow optional profile_image
                update_date: currentDate, 
                profile_image_public_id: imagePublicId,
            }
        });

        return updatedUser;

    } catch (error) {
        console.error("Error updating user:", error);
        throw new Error(error.message || "An error occurred while updating the user.");
    }
}

