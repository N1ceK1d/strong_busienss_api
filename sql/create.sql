CREATE TABLE Tests (
	id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL
);

CREATE TABLE Params (
	id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name TEXT NOT NULL
);

CREATE TABLE Questions (
	id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    questions TEXT NOT NULL,
    test_id INT NOT NULL,
    param_id INT NULL,
    FOREIGN KEY (param_id) REFERENCES Params (id),
    FOREIGN KEY (test_id) REFERENCES Tests (id)
);

CREATE TABLE Answers (
	id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    answer TEXT NULL, 
    points INT NULL,
    answer_char VARCHAR(3) NULL,
    question_id INT NOT NULL,
    FOREIGN KEY (question_id) REFERENCES Questions (id)
);

CREATE TABLE Companies (
	id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR (255) NOT NULL
);

CREATE TABLE Users (
	id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(255) NULL,
    second_name VARCHAR(255) NULL,
    last_name VARCHAR(255) NULL,
    post_position VARCHAR(255) NULL,
    gender BOOLEAN NULL, 
    is_anon BOOLEAN NOT NULL,
    test_time DATETIME NOT NULL,
    company_id INT NOT NULL,
    FOREIGN KEY (company_id) REFERENCES Companies(id)
);

CREATE TABLE UsersAnswer (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    answer_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users (id),
    FOREIGN KEY (answer_id) REFERENCES Answers (id)
);

CREATE TABLE QuestionImages (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    image_path TEXT NOT NULL,
    question_id INT NULL,
    Foreign Key (question_id) REFERENCES Questions(id)
);