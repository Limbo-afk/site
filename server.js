require('dotenv').config(); // Загружаем переменные окружения из .env файла

const express = require('express');
const path = require('path');
const { Pool } = require('pg'); // Импортируем Pool из pg
const bcrypt = require('bcrypt');
const cors = require('cors'); // Импортируем cors
const jwt = require('jsonwebtoken'); // Импортируем jsonwebtoken

// --- Настройка подключения к БД --- 
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Проверка подключения к БД
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Ошибка подключения к базе данных!', err.stack);
  }
  console.log('Успешное подключение к базе данных PostgreSQL');
  client.release(); // Возвращаем клиента обратно в пул
});

// --- Проверка JWT секрета ---
if (!process.env.JWT_SECRET) {
    console.error('Критическая ошибка: JWT_SECRET не задан в .env файле!');
    process.exit(1); // Завершаем работу, т.к. без секрета нельзя
}

const app = express();
const port = process.env.PORT || 3000; // Используем порт из .env или 3000 по умолчанию

// Middleware для парсинга JSON-тел запросов
app.use(express.json());

// Middleware для парсинга URL-encoded тел запросов (для форм)
app.use(express.urlencoded({ extended: true }));

// Middleware для включения CORS для всех маршрутов
app.use(cors());

// --- Статические файлы (HTML, CSS, JS с фронтенда) ---
// Указываем Express, где лежат статические файлы
// Мы будем использовать наш существующий фронтенд
app.use(express.static(path.join(__dirname, '/'))); 

// --- Маршруты API --- 
// Пример простого маршрута
app.get('/api/test', (req, res) => {
    res.json({ message: 'Бэкенд работает!' });
});

// --- РЕГИСТРАЦИЯ ПОЛЬЗОВАТЕЛЯ ---
app.post('/api/register', async (req, res) => {
    console.log('--- Получен запрос на /api/register ---'); // Логгирование начала
    console.log('Тело запроса (req.body):', req.body); // Логгирование данных

    const { fname, lname, phone, email, password, password_confirm } = req.body;

    // --- Простая серверная валидация ---
    // ... (код валидации) ...

    try {
        console.log('Хеширование пароля...'); // Логгирование перед хешированием
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        console.log('Пароль успешно хеширован.'); // Логгирование после хеширования

        console.log('Выполнение запроса к БД...'); // Логгирование перед запросом к БД
        const newUserQuery = `
            INSERT INTO users (first_name, last_name, phone, email, password_hash) 
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, email, first_name;
        `;
        const values = [fname, lname, phone, email, passwordHash];

        console.log('Перед await pool.query');
        const result = await pool.query(newUserQuery, values);
        console.log('После await pool.query. Результат:', result ? 'Есть результат (строк: ' + result.rowCount + ')' : 'Результата нет');

        if (result && result.rows.length > 0) {
             console.log('Пользователь успешно зарегистрирован в БД:', result.rows[0]);
             console.log('Отправка успешного ответа клиенту...'); // Лог перед отправкой ответа
             res.status(201).json({ success: true, message: 'Регистрация прошла успешно!', user: result.rows[0] });
        } else {
            console.error('Не удалось добавить пользователя в БД (result.rows пустой или нет результата)');
            res.status(500).json({ success: false, message: 'Не удалось завершить регистрацию (данные не сохранены).' });
        }

    } catch (error) {
        console.error('--- ОШИБКА В CATCH БЛОКЕ РЕГИСТРАЦИИ ---'); 
        console.error('Ошибка при регистрации:', error);

        // Проверяем код ошибки PostgreSQL для нарушения уникальности
        if (error.code === '23505') { 
            let message = 'Пользователь с такими данными уже существует.';
            // Попробуем уточнить, какое поле дублируется (email или phone)
            if (error.constraint && error.constraint.includes('email')) {
                message = 'Пользователь с таким email уже существует.';
            } else if (error.constraint && error.constraint.includes('phone')) {
                message = 'Пользователь с таким телефоном уже существует.';
            }
            console.log('Отправка ответа 400 (Дубликат):', message);
            return res.status(400).json({ success: false, message: message }); 
        }

        // Если это не ошибка дубликата, отправляем 500
        console.log('Отправка ответа 500 (Другая ошибка)');
        res.status(500).json({ success: false, message: 'Ошибка сервера при регистрации.' });
    }
});

// --- ВХОД ПОЛЬЗОВАТЕЛЯ ---
app.post('/api/login', async (req, res) => {
    console.log('--- Получен запрос на /api/login ---');
    console.log('Тело запроса:', req.body);
    
    const { phone, password } = req.body; // Логин по номеру телефона

    if (!phone || !password) {
        return res.status(400).json({ success: false, message: 'Введите номер телефона и пароль.' });
    }

    try {
        // Ищем пользователя по номеру телефона
        const findUserQuery = 'SELECT id, email, first_name, password_hash FROM users WHERE phone = $1';
        const result = await pool.query(findUserQuery, [phone]);

        if (result.rows.length === 0) {
            // Пользователь не найден
            console.log('Пользователь с телефоном', phone, 'не найден.');
            return res.status(401).json({ success: false, message: 'Неверный номер телефона или пароль.' });
        }

        const user = result.rows[0];
        console.log('Найден пользователь:', { id: user.id, email: user.email });

        // Сравниваем предоставленный пароль с хешем в БД
        console.log('Сравнение паролей...');
        const match = await bcrypt.compare(password, user.password_hash);

        if (match) {
            // Пароли совпадают - Успешный вход
            console.log('Пароли совпадают. Успешный вход для пользователя', user.id);
            
            // *** Создание JWT токена ***
            const payload = { 
                id: user.id, 
                email: user.email, 
                firstName: user.first_name 
            };
            const secret = process.env.JWT_SECRET;
            const options = { expiresIn: '1h' }; // Токен будет действителен 1 час

            const token = jwt.sign(payload, secret, options);
            console.log('Сгенерирован JWT токен для пользователя', user.id);
            
            // Отправляем токен клиенту
            res.status(200).json({ 
                success: true, 
                message: 'Вход выполнен успешно!', 
                token: token, // Добавляем токен в ответ
                user: { // Оставляем user для немедленного обновления UI
                    id: user.id, 
                    email: user.email, 
                    firstName: user.first_name 
                } 
            });
        } else {
            // Пароли не совпадают
            console.log('Пароли не совпадают для пользователя', user.id);
            res.status(401).json({ success: false, message: 'Неверный номер телефона или пароль.' });
        }

    } catch (error) {
        console.error('Ошибка при входе:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера при входе.' });
    }
});

// --- Middleware для проверки токена (пример) ---
// Мы добавим его позже к защищенным маршрутам
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) return res.sendStatus(401); // если нет токена

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Ошибка проверки JWT:', err.message);
            return res.sendStatus(403); // Неверный токен
        }
        req.user = user; // Сохраняем данные пользователя в запросе
        console.log('JWT токен успешно проверен для пользователя:', user.id);
        next(); // Передаем управление следующему обработчику
    });
};

// --- Пример защищенного маршрута (пока для теста) ---
app.get('/api/profile', authenticateToken, (req, res) => {
    // req.user был добавлен миддлвером authenticateToken
    // Здесь мы можем быть уверены, что пользователь аутентифицирован
    // В реальном приложении, можно еще раз сходить в БД за свежими данными
    res.json({ success: true, userData: req.user }); 
});

// --- Запуск сервера ---
app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
    console.log(`Сайт доступен по адресу: http://localhost:${port}`);
}); 