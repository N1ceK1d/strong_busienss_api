const pool = require('../config/db');
const client_service = require('../services/client.service');

exports.updateData = async (req, res, next) => {
    try {
      console.log(req.body)
      const user_data = req.body;
      const result = await client_service.update_user(user_data);
      console.log(result)
      res.json(result);
    } catch (error) {
      next(error);
    }
}