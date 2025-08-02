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

CREATE TABLE Tariffs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_days INTEGER NOT NULL,  -- срок действия в днях
    max_users INTEGER,               -- максимальное количество пользователей
    allow_anonymous BOOLEAN DEFAULT FALSE,
    has_analytics BOOLEAN DEFAULT FALSE,
    has_support BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ClientTariffs (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES Clients(id) ON DELETE CASCADE,
    tariff_id INTEGER NOT NULL REFERENCES tariffs(id),
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    start_date TIMESTAMP NOT NULL,         -- дата начала действия
    end_date TIMESTAMP NOT NULL,           -- дата окончания
    price_paid DECIMAL(10, 2) NOT NULL,    -- фактически оплаченная сумма
    has_consultant BOOLEAN DEFAULT FALSE,  -- включен ли консультант
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending/paid/failed/refunded
    payment_method VARCHAR(50),            -- способ оплаты
    transaction_id VARCHAR(100),           -- ID транзакции в платежной системе
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE TariffFeatures (
    id SERIAL PRIMARY KEY,
    tariff_id INTEGER NOT NULL REFERENCES tariffs(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL,
    feature_value TEXT,
    is_limited BOOLEAN DEFAULT FALSE,
    limit_value INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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