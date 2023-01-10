const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');

router.get('/', authorization, async (req, res) => {
  try {
    const user = await pool.query(
      'SELECT user_name, user_id FROM users WHERE user_id = $1',
      [req.user]
    );

    if (user.rows.length === 0)
      res.json({ messsage: 'Wrong email or password' });
    else res.json(user.rows[0]);
  } catch (error) {
    console.error(error.messsage);
    res.status(500).json('Server error');
  }
});

module.exports = router;
