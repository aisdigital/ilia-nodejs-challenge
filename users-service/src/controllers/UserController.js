const userService = require('../services/UserService');

class UserController {
  /**
   * Creates a new user
   * POST /users
   */
  async createUser(req, res) {
    try {
      const { first_name, last_name, email, password } = req.body;

      const user = await userService.createUser(
        first_name,
        last_name,
        email,
        password
      );

      res.status(200).json({
        id: user.id,
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
      });
    } catch (error) {
      console.error('Error creating user:', error);
      
      if (error.message === 'Email already exists') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Lists all users
   * GET /users
   */
  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers();

      const formattedUsers = users.map(user => ({
        id: user.id,
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
      }));

      res.status(200).json(formattedUsers);
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Gets a user by ID
   * GET /users/:id
   */
  async getUserById(req, res) {
    try {
      const { id } = req.params;

      if(req.user.userId !== id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const user = await userService.getUserById(id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json({
        id: user.id,
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
      });
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Updates a user
   * PATCH /users/:id
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;

      if(req.user.userId !== id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const { first_name, last_name, email, password } = req.body;

      const updateData = {};
      if (first_name) updateData.firstName = first_name;
      if (last_name) updateData.lastName = last_name;
      if (email) updateData.email = email;
      if (password) updateData.password = password;

      const user = await userService.updateUser(id, updateData);

      res.status(200).json({
        id: user.id,
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
      });
    } catch (error) {
      console.error('Error updating user:', error);
      
      if (error.message === 'User not found') {
        return res.status(404).json({ error: 'User not found' });
      }
      
      if (error.message === 'Email already exists') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Deletes a user
   * DELETE /users/:id
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      if(req.user.userId !== id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      await userService.deleteUser(id);

      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      
      if (error.message === 'User not found') {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new UserController();

