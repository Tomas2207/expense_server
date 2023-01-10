const router = require('express').Router();
const pool = require('../db');

router.post('/', async (req, res) => {
  const { income_amount, income_date, user_id } = req.body;
  try {
    let newIncome = await pool.query(
      'INSERT INTO income (income_amount, income_date, user_id) VALUES ($1, $2, $3) RETURNING * ',
      [income_amount, income_date, user_id]
    );
    res.status(200).json({ success: 'Added Income' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json(error.message);
  }
});

//chart data
router.get('/chart', async (req, res) => {
  const data = await pool.query(
    `SELECT EXTRACT (MONTH from income_date), COALESCE(SUM(income_amount)) AS amount FROM income WHERE user_id ='${
      req.query.id
    }' AND income_date BETWEEN '${req.query.year}-01-01' AND '${
      parseInt(req.query.year) + 1
    }-01-01' GROUP BY date_part ORDER BY date_part`
  );
  res.json(data.rows);
});

//sum income
router.get('/sum/:id', async (req, res) => {
  const sum = await pool.query(
    'SELECT SUM(income_amount) FROM income WHERE user_id = $1',
    [req.params.id]
  );
  res.json(sum.rows);
});

//get user income

router.get('/:id', async (req, res) => {
  try {
    let Income = await pool.query('SELECT * FROM income WHERE user_id = $1', [
      req.params.id,
    ]);

    if (Income.rows.length === 0) {
      return res.send({ message: 'no income' });
    } else {
      res.status(200).json(Income.rows);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json(error.message);
  }
});

//delete income

router.delete('/delete/:id', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM income WHERE income_id = $1 AND user_id = $2',
      [req.body.income_id, req.params.id]
    );
    res.status(200).json({ success: 'Deleted succesfully' });
  } catch (error) {
    res.status(500).send({ error: "Couldn't delete income" });
    console.error(error.message);
  }
});

module.exports = router;
