const router = require('express').Router();
const pool = require('../db');
var types = require('pg').types;
types.setTypeParser(types.builtins.DATE, (val) => val);

router.get('/years/:id', async (req, res) => {
  try {
    const years = await pool.query(
      'SELECT DISTINCT EXTRACT (year from expense_date) FROM expense WHERE user_id = $1',
      [req.params.id]
    );
    if (years.rows.length === 0) {
      return res.send({ message: 'no years' });
    } else {
      return res.status(200).json(years.rows);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { expense_category, expense_amount, expense_date, user_id } = req.body;
  try {
    let newExpense = await pool.query(
      'INSERT INTO expense (expense_category, expense_amount,expense_date, user_id) VALUES ($1, $2, $3, $4) RETURNING * ',
      [expense_category, expense_amount, expense_date, user_id]
    );
    res.status(200).json({ success: 'Added Expense' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json('error', error.message);
  }
});

router.get('/chart', async (req, res) => {
  data = await pool.query(
    `SELECT EXTRACT (MONTH from expense_date), COALESCE(SUM(expense_amount)) AS amount FROM expense WHERE user_id = '${
      req.query.id
    }' AND expense_date BETWEEN '${req.query.year}-01-01' AND '${
      parseInt(req.query.year) + 1
    }-01-01' GROUP BY date_part ORDER BY date_part`
  );
  res.json(data.rows);
});

router.get('/pie', async (req, res) => {
  let nextMonth = parseInt(req.query.month) + 2;
  let day = 1;
  if (req.query.month == '11') {
    nextMonth = parseInt(req.query.month) + 1;
    day = 21;
  }
  data = await pool.query(
    `SELECT DISTINCT expense_category, COALESCE (SUM(expense_amount)) AS amount FROM expense WHERE user_id = '${
      req.query.id
    }' AND expense_date BETWEEN '${req.query.year}-${
      parseInt(req.query.month) + 1
    }-1' AND  '${req.query.year}-${nextMonth}-${day}' GROUP BY expense_category`
  );
  res.json(data.rows);
});

//sum expenses
router.get('/sum/:id', async (req, res) => {
  const sum = await pool.query(
    'SELECT SUM(expense_amount) FROM expense WHERE user_id = $1',
    [req.params.id]
  );
  res.json(sum.rows);
});

//delete expense

router.delete('/delete/:id', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM expense WHERE expense_id = $1 AND user_id = $2',
      [req.body.expense_id, req.params.id]
    );
    res.status(200).json({ success: 'Deleted succesfully' });
  } catch (error) {
    res.status(500).send({ error: "Couldn't delete expense" });
    console.error(error.message);
  }
});

//get expenses of user

router.get('/expense/:id', async (req, res) => {
  try {
    const expenses = await pool.query(
      'SELECT * FROM expense WHERE user_id = $1 ORDER BY expense_date DESC',
      [req.params.id]
    );

    if (expenses.rows.length === 0) {
      return res.send({ message: 'no expenses' });
    } else {
      return res.status(200).json(expenses.rows);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
