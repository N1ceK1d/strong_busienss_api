#

CREATE TABLE TestTypes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT
);

INSERT INTO TestTypes (id, name, description) VALUES 
(1, 'Тестирование кандидата/сотрудника', 'Индивидуальное тестирование'),
(2, 'Анализ персонала компании', 'Групповой анализ и отчеты');

#

ALTER TABLE Tests ADD COLUMN test_type_id INTEGER REFERENCES TestTypes(id);


CREATE TABLE Tariffs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_days INTEGER NOT NULL,
    test_type_id INTEGER REFERENCES TestTypes(id),
    max_users INTEGER,
    has_analytics BOOLEAN DEFAULT FALSE,
    allow_anonymous BOOLEAN DEFAULT FALSE,
    has_support BOOLEAN DEFAULT FALSE,
    is_recurring BOOLEAN DEFAULT FALSE
);

-- Тарифы для тестирования кандидатов (тип 1)
INSERT INTO Tariffs (name, description, price, duration_days, test_type_id, max_users, has_analytics, allow_anonymous, has_support, is_recurring) VALUES
('Разовый тест', 'Доступ к одному тесту кандидата', 1000.00, 0, 1, 1, FALSE, FALSE, FALSE, FALSE),
('Подписка 1 месяц', 'Месячная подписка на тесты кандидатов', 5000.00, 30, 1, 10, FALSE, FALSE, FALSE, TRUE),
('Подписка 3 месяца', 'Квартальная подписка на тесты кандидатов', 12000.00, 90, 1, 10, FALSE, FALSE, FALSE, TRUE),
('Подписка 6 месяцев', 'Полугодовая подписка на тесты кандидатов', 20000.00, 180, 1, 10, FALSE, FALSE, FALSE, TRUE);

-- Тарифы для анализа персонала (тип 2)
INSERT INTO Tariffs (name, description, price, duration_days, test_type_id, max_users, has_analytics, allow_anonymous, has_support, is_recurring) VALUES
('Разовый анализ', 'Разовый анализ персонала компании', 5000.00, 0, 2, 50, TRUE, FALSE, FALSE, FALSE),
('Премиум анализ', 'Анализ персонала с промокодом', 8000.00, 0, 2, 100, TRUE, TRUE, TRUE, FALSE);


CREATE TABLE PromoCodes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percent INTEGER,
    discount_amount DECIMAL(10, 2),
    valid_from TIMESTAMP NOT NULL,
    valid_to TIMESTAMP NOT NULL,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    tariff_id INTEGER REFERENCES Tariffs(id),
    test_type_id INTEGER REFERENCES TestTypes(id)
);


CREATE TABLE ClientSubscriptions (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES Clients(id),
    tariff_id INTEGER NOT NULL REFERENCES Tariffs(id),
    start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    has_consultant BOOLEAN DEFAULT FALSE,
    promo_code_id INTEGER REFERENCES PromoCodes(id),
    payment_amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    auto_renew BOOLEAN DEFAULT FALSE
);


CREATE TABLE TestAccess (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER REFERENCES ClientSubscriptions(id),
    test_id INTEGER NOT NULL REFERENCES Tests(id),
    user_id INTEGER REFERENCES Users(id),
    access_granted TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    access_expires TIMESTAMP,
    is_used BOOLEAN DEFAULT FALSE,
    is_anonymous BOOLEAN DEFAULT FALSE
);  



CREATE TABLE Payments (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES Clients(id),
    subscription_id INTEGER REFERENCES ClientSubscriptions(id),
    amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50),
    status VARCHAR(20) NOT NULL,
    transaction_id VARCHAR(100),
    description TEXT
);


CREATE INDEX idx_client_subscriptions_client_id ON ClientSubscriptions(client_id);
CREATE INDEX idx_client_subscriptions_tariff_id ON ClientSubscriptions(tariff_id);
CREATE INDEX idx_client_subscriptions_end_date ON ClientSubscriptions(end_date);
CREATE INDEX idx_test_access_subscription_id ON TestAccess(subscription_id);
CREATE INDEX idx_test_access_test_id ON TestAccess(test_id);
CREATE INDEX idx_payments_client_id ON Payments(client_id);
CREATE INDEX idx_payments_subscription_id ON Payments(subscription_id);




#####################################


-- Типы тестов
CREATE TABLE test_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

-- Добавляем тип к тестам
ALTER TABLE tests ADD COLUMN test_type_id INTEGER REFERENCES test_types(id);

-- Тарифы
CREATE TABLE tariffs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration_days INTEGER, -- NULL для разовых тестов
  test_type_id INTEGER REFERENCES test_types(id),
  is_recurring BOOLEAN DEFAULT FALSE
);

-- Промокоды
CREATE TABLE promo_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_percent INTEGER,
  valid_from DATE NOT NULL,
  valid_to DATE NOT NULL,
  tariff_id INTEGER REFERENCES tariffs(id)
);

-- Доступы клиентов
CREATE TABLE client_access (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id) NOT NULL,
  tariff_id INTEGER REFERENCES tariffs(id) NOT NULL,
  test_id INTEGER REFERENCES tests(id),
  purchase_date TIMESTAMP DEFAULT NOW(),
  expiry_date TIMESTAMP,
  is_used BOOLEAN DEFAULT FALSE,
  promo_code_id INTEGER REFERENCES promo_codes(id)
);


-- Добавляем типы тестов
INSERT INTO test_types (id, name) VALUES 
(1, 'Тестирование кандидата'),
(2, 'Анализ персонала');

-- Тарифы для тестирования кандидатов
INSERT INTO tariffs (name, price, duration_days, test_type_id, is_recurring) VALUES
('Разовый тест', 1000, NULL, 1, FALSE),
('Подписка 1 месяц', 5000, 30, 1, TRUE),
('Подписка 3 месяца', 12000, 90, 1, TRUE),
('Подписка 6 месяцев', 20000, 180, 1, TRUE);

-- Тарифы для анализа персонала
INSERT INTO tariffs (name, price, duration_days, test_type_id, is_recurring) VALUES
('Разовый анализ', 5000, NULL, 2, FALSE);

-- Пример промокода
INSERT INTO promo_codes (code, discount_percent, valid_from, valid_to, tariff_id) VALUES
('SUMMER2023', 15, '2023-06-01', '2023-08-31', 5);


CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'RUB',
  payment_system VARCHAR(50) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending',
  payment_id VARCHAR(100), -- ID платежа в системе агрегатора
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  description TEXT,
  tariff_id INTEGER REFERENCES tariffs(id)
);