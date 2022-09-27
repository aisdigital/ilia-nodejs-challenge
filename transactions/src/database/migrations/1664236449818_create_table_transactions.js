module.exports = {
    "up": "CREATE TABLE transactions (transaction_id TINYINT auto_increment NOT NULL, amount INTEGER NOT NULL, type ENUM ('CREDIT', 'DEBIT') NULL, `user_fk_transaction)id` TINYINT NULL, created_at DATETIME NULL, updated_at DATETIME NULL, CONSTRAINT transactions_PK PRIMARY KEY (transaction_id), CONSTRAINT transactions_FK FOREIGN KEY (transaction_id) REFERENCES mydatabasename.users(id)) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;",
    "down": "DROP TABLE transactions"
}