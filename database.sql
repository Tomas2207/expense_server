CREATE DATABASE expenses;

CREATE TABLE expense(
    expense_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    expense_category VARCHAR(150) NOT NULL,
    expense_amount NUMERIC NOT NULL,
    expense_date DATE NOT NULL,
    user_id uuid REFERENCES users (user_id)
);

CREATE TABLE income(
    income_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    income_amount NUMERIC NOT NULL,
    income_date DATE NOT NULL,
    user_id uuid REFERENCES users (user_id)
);
