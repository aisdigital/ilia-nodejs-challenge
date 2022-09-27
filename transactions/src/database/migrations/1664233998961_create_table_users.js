module.exports = {
    "up": "CREATE TABLE users (id TINYINT auto_increment NOT NULL, first_name VARCHAR(100) NULL, last_name varchar(100) NULL, email varchar(100) NULL, balance INT DEFAULT 0 NOT NULL, created_at DATETIME NULL, updated_at DATETIME NULL, CONSTRAINT Users_PK PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci",
    "down": "DROP TABLE users"
}