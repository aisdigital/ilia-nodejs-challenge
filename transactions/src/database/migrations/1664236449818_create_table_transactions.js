module.exports = {
    "up": "CREATE TABLE transactions (transaction_id TINYINT auto_increment NOT NULL, amount INTEGER NOT NULL, type ENUM ('CREDIT', 'DEBIT') NULL, `user_fk_transaction_id` TINYINT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, CONSTRAINT transactions_PK PRIMARY KEY (transaction_id), CONSTRAINT transactions_FK FOREIGN KEY (user_fk_transaction_id) REFERENCES mydatabasename.users(id)) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;",
    "down": "DROP TABLE transactions"
}