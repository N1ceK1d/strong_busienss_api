CREATE TABLE Tests (
	id SERIAL NOT NULL PRIMARY KEY ,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL
);

CREATE TABLE Params (
	id SERIAL NOT NULL PRIMARY KEY ,
    name TEXT NOT NULL
);

CREATE TABLE Questions (
	id SERIAL NOT NULL PRIMARY KEY ,
    questions TEXT NOT NULL,
    test_id INT NOT NULL,
    param_id INT NULL,
    FOREIGN KEY (param_id) REFERENCES Params (id),
    FOREIGN KEY (test_id) REFERENCES Tests (id)
);

CREATE TABLE Answers (
	id SERIAL NOT NULL PRIMARY KEY ,
    answer TEXT NULL, 
    points INT NULL,
    answer_char VARCHAR(3) NULL,
    question_id INT NOT NULL,
    FOREIGN KEY (question_id) REFERENCES Questions (id)
);

CREATE TABLE Companies (
	id SERIAL NOT NULL PRIMARY KEY ,
    name VARCHAR (255) NOT NULL
);

CREATE TABLE Users (
	id SERIAL NOT NULL PRIMARY KEY ,
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
    id SERIAL NOT NULL PRIMARY KEY ,
    user_id INT NOT NULL,
    answer_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users (id),
    FOREIGN KEY (answer_id) REFERENCES Answers (id)
);

CREATE TABLE QuestionImages (
    id SERIAL NOT NULL PRIMARY KEY ,
    image_path TEXT NOT NULL,
    question_id INT NULL,
    Foreign Key (question_id) REFERENCES Questions(id)
);


CREATE TABLE Tests (
	id SERIAL NOT NULL PRIMARY KEY ,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    allow_anonymous BOOLEAN NOT NULL
);

CREATE TABLE Params (
	id SERIAL NOT NULL PRIMARY KEY ,
    name TEXT NOT NULL
);

CREATE TABLE Questions (
	id SERIAL NOT NULL PRIMARY KEY ,
    questions TEXT NOT NULL,
    test_id INT NOT NULL,
    param_id INT NULL,
    FOREIGN KEY (param_id) REFERENCES Params (id),
    FOREIGN KEY (test_id) REFERENCES Tests (id)
);

CREATE TABLE Answers (
	id SERIAL NOT NULL PRIMARY KEY ,
    answer TEXT NULL, 
    points INT NULL,
    answer_char VARCHAR(3) NULL,
    question_id INT NOT NULL,
    FOREIGN KEY (question_id) REFERENCES Questions (id)
);

CREATE TABLE Companies (
	id SERIAL NOT NULL PRIMARY KEY ,
    name VARCHAR (255) NOT NULL
);

CREATE TABLE Clients (
    id SERIAL NOT NULL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    middle_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    password TEXT NOT NULL,
    company_id INT NOT NULL,
    Foreign Key (company_id) REFERENCES Companies(id)
);

ALTER TABLE Clients ADD COLUMN phone VARCHAR(255) NOT NULL;
ALTER TABLE Tests ADD COLUMN allow_anonymous BOOLEAN;

ALTER TABLE companies ADD CONSTRAINT companies_name_unique UNIQUE (name);

CREATE TABLE Users (
	id SERIAL NOT NULL PRIMARY KEY ,
    first_name VARCHAR(255) NULL,
    second_name VARCHAR(255) NULL,
    last_name VARCHAR(255) NULL,
    post_position VARCHAR(255) NULL,
    gender BOOLEAN NULL, 
    is_anon BOOLEAN NOT NULL,
    test_time TIMESTAMP NOT NULL,
    company_id INT NOT NULL,
    is_director BOOLEAN NULL,
    FOREIGN KEY (company_id) REFERENCES Companies(id)
);

CREATE TABLE UsersAnswer (
    id SERIAL NOT NULL PRIMARY KEY ,
    user_id INT NOT NULL,
    answer_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users (id),
    FOREIGN KEY (answer_id) REFERENCES Answers (id)
);

CREATE TABLE QuestionImages (
    id SERIAL NOT NULL PRIMARY KEY ,
    image_path TEXT NOT NULL,
    question_id INT NULL,
    Foreign Key (question_id) REFERENCES Questions(id)
);



-- Таблица типов доступа
CREATE TABLE AccessTypes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- Таблица тарифных планов
CREATE TABLE Tariffs (
    id SERIAL PRIMARY KEY,
    access_type_id INTEGER NOT NULL REFERENCES AccessTypes(id),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_days INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Таблица покупок клиентов
CREATE TABLE ClientTariffs (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES Clients(id),
    tariff_id INTEGER NOT NULL REFERENCES Tariffs(id),
    purchase_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Таблица тестов, включенных в тарифы
CREATE TABLE TariffTests (
    tariff_id INTEGER NOT NULL REFERENCES Tariffs(id),
    test_id INTEGER NOT NULL REFERENCES Tests(id),
    PRIMARY KEY (tariff_id, test_id)
);


-- Типы доступа
INSERT INTO AccessTypes (name, description) VALUES 
('candidates', 'Тестирование кандидатов'),
('analytics', 'Анализ персонала компании');

-- Тарифы для тестирования кандидатов
INSERT INTO Tariffs (access_type_id, title, description, price, duration_days) VALUES
(1, 'Разовый тест', 'Доступ на 1 день', 500, 1),
(1, 'Подписка на 1 месяц', 'Неограниченное тестирование', 1500, 30),
(1, 'Подписка на 3 месяца', 'Скидка 20%', 3600, 90);

-- Тарифы для анализа персонала
INSERT INTO Tariffs (access_type_id, title, description, price, duration_days) VALUES
(2, 'Разовый отчет', 'Анализ до 10 сотрудников', 2000, 1),
(2, 'Месячная подписка', 'Неограниченная аналитика', 5000, 30);

-- Связь тарифов с тестами
-- Предположим, что тесты 1,2,3 относятся к кандидатам, а 4,5 - к аналитике
INSERT INTO TariffTests (tariff_id, test_id) VALUES
(1,1), (1,2), (1,3),
(2,1), (2,2), (2,3),
(3,1), (3,2), (3,3),
(4,4), (4,5),
(5,4), (5,5);


-- Таблица доступа к тестам
CREATE TABLE ClientTestsAccess (
    client_id INTEGER NOT NULL REFERENCES Clients(id),
    test_id INTEGER NOT NULL REFERENCES Tests(id),
    company_id INTEGER NOT NULL REFERENCES Companies(id),
    access_from TIMESTAMP NOT NULL,
    access_to TIMESTAMP NOT NULL,
    PRIMARY KEY (client_id, test_id)
);

-- Таблица платежей
CREATE TABLE Payments (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES Clients(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed'))
);