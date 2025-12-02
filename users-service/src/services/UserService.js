const User = require('../models/User');
const bcrypt = require('bcrypt');
const walletClient = require('./WalletClient');

class UserService {
  /**
   * Creates a new user
   * @param {string} firstName - First name
   * @param {string} lastName - Last name
   * @param {string} email - Email
   * @param {string} password - Password
   * @returns {Promise<User>}
   */
  async createUser(firstName, lastName, email, password) {
    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    // Create wallet for user (internal communication)
    await walletClient.createWalletForUser(user.id);

    return user;
  }

  /**
   * Lists all users
   * @returns {Promise<User[]>}
   */
  async getAllUsers() {
    const users = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });

    return users;
  }

  /**
   * Gets a user by ID
   * @param {string} id - User ID
   * @returns {Promise<User|null>}
   */
  async getUserById(id) {
    const user = await User.findByPk(id, {
      attributes: ['id', 'firstName', 'lastName', 'email', 'createdAt'],
    });

    return user;
  }

  /**
   * Updates a user
   * @param {string} id - User ID
   * @param {object} updateData - Data to update
   * @returns {Promise<User>}
   */
  async updateUser(id, updateData) {
    const user = await User.findByPk(id);
    
    if (!user) {
      throw new Error('User not found');
    }

    // If email is being updated, check if it already exists
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findOne({ where: { email: updateData.email } });
      if (existingUser) {
        throw new Error('Email already exists');
      }
    }

    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Update fields
    if (updateData.firstName) user.firstName = updateData.firstName;
    if (updateData.lastName) user.lastName = updateData.lastName;
    if (updateData.email) user.email = updateData.email;
    if (updateData.password) user.password = updateData.password;
    
    user.updatedAt = new Date();
    await user.save();

    return user;
  }

  /**
   * Deletes a user
   * @param {string} id - User ID
   * @returns {Promise<boolean>}
   */
  async deleteUser(id) {
    const user = await User.findByPk(id);
    
    if (!user) {
      throw new Error('User not found');
    }

    await user.destroy();
    return true;
  }

  /**
   * Authenticates a user
   * @param {string} email - Email
   * @param {string} password - Password
   * @returns {Promise<User>}
   */
  async authenticateUser(email, password) {
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    return user;
  }
}

module.exports = new UserService();

