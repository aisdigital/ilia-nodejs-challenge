module.exports = {
    "up": "CREATE TABLE users (id TINYINT auto_increment NOT NULL, first_name VARCHAR(100) NULL, last_name varchar(100) NULL, email varchar(100) NULL, password varchar(100), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, CONSTRAINT Users_PK PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci",
    "down": "DROP TABLE users"
}