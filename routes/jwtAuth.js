const router = require('express').Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwtGenerator = require('../utils/jwtGenerator');
const validInfo = require('../middleware/validInfo');
const authorization = require('../middleware/authorization');

router.post('/register', validInfo, async (req, res) => {
  //1. destructure req.body
  const { email, name, password } = req.body;
  try {
    //2 Check if user exists
    const user = await pool.query('SELECT * FROM users WHERE user_email = $1', [
      email,
    ]);

    if (user.rows.length > 0) {
      return res.status(401).json('user already exists');
    }
    //3.Bcrypt users password

    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);
    //4.enter the new user inside db
    let newUser = await pool.query(
      'INSERT INTO users (user_name, user_email, user_password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, bcryptPassword]
    );

    //5.generating jwt token
    const token = jwtGenerator(newUser.rows[0].user_id);
    res.json({ token });
  } catch (error) {
    console.error(error.message);
    res.status(500).json('server error');
  }
});

//login

router.post('/login', validInfo, async (req, res) => {
  try {
    //.1 destructure the req.body

    const { email, password } = req.body;

    //2. Check if user doesn't exist

    const user = await pool.query('SELECT * FROM users WHERE user_email = $1', [
      email,
    ]);

    if (user.rows.length === 0) {
      return res.status(401).json('Password or Email is incorrect');
    }

    //3.check if incoming password is same as db password

    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].user_password
    );
    if (!validPassword) {
      return res.status(401).json('Password or Email is incorrect');
    }

    //4. give jwt token

    const token = jwtGenerator(user.rows[0].user_id);
    res.json({ token });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('server error');
  }
});

router.get('/is-verified', authorization, async (req, res) => {
  try {
    res.json(true);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('server error');
  }
});

module.exports = router;
