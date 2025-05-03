// --- Код для Яндекс Карт --- 
ymaps.ready(init);

function init() {
    // Создание карты.
    const myMap = new ymaps.Map("map", {
        // Координаты центра карты - Самара
        center: [53.2001, 50.15],
        // Уровень масштабирования.
        zoom: 13,
        // Убираем лишние кнопки (тип карты, поиск)
        controls: ['zoomControl', 'fullscreenControl']
    });

    // Массив с данными о точках проката (переименован из bikeStations для ясности)
    const rentalPointsData = [
         {
            coords: [53.1959, 50.1002], // Самара, Площадь Куйбышева (пример)
            name: 'Точка 1: Площадь Куйбышева',
            location: 'Площадь Куйбышева', // Добавим поле для единообразия
            workHours: '08:00 - 22:00',
            description: 'Классные велики!', // Добавим описание
            id: 1 // Добавим ID для кнопки
        },
        {
            coords: [53.2037, 50.1605], // Самара, Набережная (пример)
            name: 'Точка 2: Набережная',
            location: 'Набережная реки Волга',
            workHours: '09:00 - 21:00',
            description: 'Самые новые модели!',
            id: 2
        },
        {
            coords: [53.2128, 50.1898], // Самара, Загородный парк (пример)
            name: 'Точка 3: Загородный парк',
            location: 'Загородный парк',
            workHours: '10:00 - 20:00',
            description: 'Отличное место для старта!',
            id: 3
        },
        // --- Сюда можно добавить твои предыдущие точки или новые ---
        {
            coords: [53.1817, 50.1135],
            location: 'Железнодорожный вокзал Самары',
            name: 'Альфа', // Используем твои названия
            workHours: '8:00 - 20:00', // Стандартные часы
            description: 'Удобно начать поездку от вокзала.',
            id: 4
        },
        {
            coords: [53.2167, 50.1694],
            location: 'Государственная Третьяковская галерея, Третьяковка в Самаре',
            name: 'Бета',
            workHours: '8:00 - 20:00',
            description: 'Совмести велопрогулку с культурой.',
            id: 5
        },
        // ... добавь остальные точки по аналогии
    ];

    // Добавление меток (placemarks) на карту
    rentalPointsData.forEach(point => {
        const placemark = new ymaps.Placemark(point.coords, {
            // Содержимое балуна (всплывающего окна)
            balloonContentHeader: `Велопрокат "${point.name}"`,
            balloonContentBody:
                `<strong>Место:</strong> ${point.location}<br>` +
                `<strong>График работы:</strong> ${point.workHours}<br>` +
                `${point.description || ''}<br>` + // Описание, если есть
                `<button class="rent-button" data-point-id="${point.id}">Арендовать здесь</button>`, // Кнопка аренды
            // Содержимое хинта (при наведении)
            hintContent: `Велопрокат "${point.name}"`
        }, {
             preset: 'islands#violetIcon', // Оставим фиолетовый стиль
             iconColor: '#a020f0'
             // Или можно вернуть 'islands#blueBicycleIcon'
        });
        myMap.geoObjects.add(placemark);
    });

    // Обработчик для кнопок "Арендовать здесь" внутри балунов
    myMap.geoObjects.events.add('balloonopen', function (e) {
        const placemark = e.get('target');
        // Получаем ID точки из данных кнопки, которые мы добавили в balloonContentBody
        const balloonContent = placemark.properties.get('balloonContentBody');
        const pointIdMatch = balloonContent.match(/data-point-id="([^"]+)"/);

        if (pointIdMatch && pointIdMatch[1]) {
            const pointId = pointIdMatch[1];
            const balloonElement = placemark.balloon.getElement(); // Получаем DOM элемент балуна

            // Находим кнопку внутри открытого балуна
            const rentButton = balloonElement.querySelector('.rent-button');
            if (rentButton) {
                 // Удаляем старый обработчик, если он есть (на всякий случай)
                 // Создаем новую функцию обработчика с захватом pointId
                const specificHandler = (event) => handleRentButtonClick(event, pointId);
                // Удаляем предыдущий обработчик, если он был привязан к этой кнопке ранее
                // (важно, если балун закрывался и открывался снова)
                if (rentButton.handler) {
                     rentButton.removeEventListener('click', rentButton.handler);
                }
                rentButton.addEventListener('click', specificHandler);
                rentButton.handler = specificHandler; // Сохраняем ссылку на обработчик
            }
        } else {
            console.warn("Не удалось извлечь pointId из балуна:", balloonContent);
        }
    });

    // Функция-обработчик клика по кнопке аренды
    function handleRentButtonClick(event, pointId) {
        event.stopPropagation(); // Останавливаем всплытие события, чтобы карта не закрыла балун
        console.log('Клик по кнопке аренды для точки ID:', pointId);

        // 1. Проверяем, залогинен ли пользователь
        const token = localStorage.getItem('authToken'); // Используем 'authToken', как раньше
        if (!token) {
            alert('Пожалуйста, войдите или зарегистрируйтесь, чтобы начать аренду.');
            // Закрываем балун карты
            myMap.balloon.close();
            // Открываем модальное окно входа
            openModal(loginModal);
            return; // Прерываем выполнение
        }

        // 2. Пользователь залогинен - можно начинать процесс аренды
        // (Пока просто выводим сообщение)
        alert(`Вы залогинены! Начинаем процесс аренды для точки ${pointId}! (Дальнейшая логика пока не реализована)`);
        // TODO: Реализовать следующий шаг - возможно, показать доступные велосипеды на этой точке?
        // Или перенаправить на страницу каталога/аренды?

        // Закрываем балун после клика (опционально)
         myMap.balloon.close();
    }

    // // --- Старый код Leaflet (удален) --- 
    // var map = L.map('map').setView([53.2001, 50.15], 13);
    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
    // bikeStations.forEach(station => { L.marker(station.coords).addTo(map).bindPopup(`Велопрокат "Крути Педали" - ${station.name}`); });

}

// --- Логика для модальных окон Входа и Регистрации ---

// Получаем элементы
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');

const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

const bikeDetailModal = document.getElementById('bike-detail-modal');
const bikeCards = document.querySelectorAll('.bike-card-clickable');

// Элементы внутри модального окна деталей
const modalBikeImage = document.getElementById('modal-bike-image');
const modalBikeTitle = document.getElementById('modal-bike-title');
const modalBikeDesc = document.getElementById('modal-bike-desc');
const modalBikeSpecsList = document.getElementById('modal-bike-specs');
const modalBikePricingDiv = document.getElementById('modal-bike-pricing');
const modalRentDurationDiv = document.getElementById('modal-rent-duration');
const modalCurrentPriceStrong = document.getElementById('modal-current-price');
const carouselPrevBtn = document.getElementById('carousel-prev');
const carouselNextBtn = document.getElementById('carousel-next');
const carouselDotsContainer = document.getElementById('carousel-dots-container');

// Переменные для состояния карусели и цен
let currentImages = [];
let currentImageIndex = 0;
let currentPriceInfo = {};

// --- Глобальная переменная для пользователя ---
let currentUser = null;

// --- Функция обновления UI (переписана с async/await) ---
async function updateAuthStateUI() { // Делаем функцию асинхронной
    const authButtonsDiv = document.getElementById('auth-buttons');
    if (!authButtonsDiv) {
        console.error("Элемент #auth-buttons не найден!");
        return;
    }
    
    const token = localStorage.getItem('authToken');
    let userFromToken = null;

    // 1. Попытка получить данные пользователя, если есть токен
    if (token) {
        console.log('Найден токен, пытаемся получить профиль...');
        try {
            const response = await fetch('/api/profile', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.userData) {
                    console.log('Профиль успешно получен по токену:', data.userData);
                    userFromToken = data.userData; 
                } else {
                    console.log('Ответ сервера не содержит данных пользователя, удаляем токен.');
                    localStorage.removeItem('authToken');
                }
            } else {
                console.log('Ошибка получения профиля по токену (статус:', response.status, '), удаляем токен.');
                localStorage.removeItem('authToken');
            }
        } catch (error) {
            console.error('Сетевая ошибка при запросе профиля по токену:', error);
            localStorage.removeItem('authToken'); // На всякий случай
        }
    }
    
    // Устанавливаем currentUser глобально
    currentUser = userFromToken; 
    
    // 2. Очищаем и рендерим кнопки в зависимости от currentUser
    authButtonsDiv.innerHTML = '';

    if (currentUser) {
        // --- Пользователь вошел --- 
        
        // 1. Создаем контейнер для иконки и выпадающего меню
        const profileContainer = document.createElement('div');
        profileContainer.style.position = 'relative'; // Для позиционирования меню
        profileContainer.style.display = 'inline-block'; // Чтобы занимал место как иконка

        // 2. Создаем ссылку-триггер (саму иконку)
        const profileTrigger = document.createElement('a');
        profileTrigger.href = '#'; // Не переходим по клику, можно потом на profile.html
        profileTrigger.title = `Профиль (${currentUser.firstName})`;
        profileTrigger.style.display = 'inline-block';
        profileTrigger.style.verticalAlign = 'middle';
        profileTrigger.id = 'profile-icon-trigger'; // ID для стилей/логики
        
        const profileIcon = document.createElement('img');
        profileIcon.src = 'profile.0ba66c2.svg'; 
        profileIcon.alt = 'Профиль';
        profileIcon.style.width = '30px'; 
        profileIcon.style.height = '30px';
        profileIcon.style.verticalAlign = 'middle';
        profileIcon.style.cursor = 'pointer';
        profileTrigger.appendChild(profileIcon);
        
        // 3. Создаем выпадающее меню (div)
        const dropdownMenu = document.createElement('div');
        dropdownMenu.classList.add('profile-dropdown-menu'); // Класс для CSS
        dropdownMenu.style.display = 'none'; // Изначально скрыто
        
        // --- Наполняем меню --- 
        dropdownMenu.innerHTML = `
            <div class="dropdown-item bonus-info">
                <span class="icon">👤</span> <!-- Заглушка иконки -->
                Мой бонусный счёт: <strong>0 ₽</strong>
            </div>
            <a href="profile.html" class="dropdown-item">
                <span class="icon">📝</span> <!-- Заглушка иконки -->
                Персональные данные
            </a>
            <div class="dropdown-item disabled">
                 <span class="icon">🎁</span> <!-- Заглушка иконки -->
                 Мои бонусы
            </div>
             <div class="dropdown-item disabled">
                 <span class="icon">💳</span> <!-- Заглушка иконки -->
                 Банковские карты
            </div>
            <hr>
            <div class="dropdown-item city-info">
                Город: <strong>Самара</strong>
            </div>
            <hr>
            <a href="#" class="dropdown-item static-link">Договор на использование сервиса</a>
            <a href="#" class="dropdown-item static-link">Политика конфиденциальности</a>
            <a href="#" class="dropdown-item static-link">Согласие на обработку данных</a>
            <hr>
        `;
        // --- Конец наполнения --- 

        // 4. Добавляем кнопку Выход в меню
        const logoutBtn = document.createElement('button');
        logoutBtn.textContent = 'Выход';
        logoutBtn.classList.add('dropdown-item', 'logout-btn-dropdown'); // Стилизуем как пункт меню + спец класс
        logoutBtn.addEventListener('click', () => {
            currentUser = null;
            localStorage.removeItem('authToken');
            updateAuthStateUI(); 
            console.log('Пользователь вышел');
        });
        dropdownMenu.appendChild(logoutBtn);

        // 5. Добавляем триггер (иконку) и меню в контейнер
        profileContainer.appendChild(profileTrigger);
        profileContainer.appendChild(dropdownMenu);
        
        // 6. Добавляем контейнер в authButtonsDiv
        authButtonsDiv.appendChild(profileContainer);
        
        // 7. Логика показа/скрытия меню
        let hideTimeout; // Таймер для скрытия
        profileContainer.addEventListener('mouseenter', () => {
            clearTimeout(hideTimeout); // Отменяем таймер скрытия, если он был
            dropdownMenu.style.display = 'block';
        });
        profileContainer.addEventListener('mouseleave', () => {
            // Ставим таймер, чтобы меню не скрылось мгновенно при уводе мыши
            hideTimeout = setTimeout(() => {
                dropdownMenu.style.display = 'none';
            }, 300); // Задержка в мс
        });

    } else {
        // Пользователь не вошел
        const loginBtnUI = document.createElement('button');
        loginBtnUI.textContent = 'Вход';
        loginBtnUI.id = 'login-btn'; // Возвращаем ID, чтобы обработчики работали
        loginBtnUI.classList.add('auth-btn');
        loginBtnUI.addEventListener('click', () => openModal(loginModal));

        const signupBtnUI = document.createElement('button');
        signupBtnUI.textContent = 'Регистрация';
        signupBtnUI.id = 'signup-btn'; // Возвращаем ID
        signupBtnUI.classList.add('auth-btn');
        signupBtnUI.addEventListener('click', () => openModal(signupModal));

        authButtonsDiv.appendChild(loginBtnUI);
        authButtonsDiv.appendChild(signupBtnUI);
    }

    // 3. Делаем контейнер видимым ПОСЛЕ отрисовки нужных кнопок
    authButtonsDiv.style.visibility = 'visible';
}

// --- Вызов функции при загрузке --- 
document.addEventListener('DOMContentLoaded', () => {
    updateAuthStateUI(); // Вызываем асинхронную функцию
});

// Функция открытия модального окна
function openModal(modal) {
    if (modal) {
        modal.style.display = 'flex'; // Используем flex для центрирования
    }
}

// Функция закрытия модального окна
function closeModal(modal) {
    if (modal) {
        modal.style.display = 'none';
        // Очистка ошибок при закрытии
        clearErrors(modal.querySelector('form')); 
    }
}

// Находим ВСЕ кнопки закрытия во ВСЕХ модальных окнах
const allCloseButtons = document.querySelectorAll('.modal .close-button');

// Закрытие окон по крестику (используем новый общий селектор)
allCloseButtons.forEach(button => {
    button.addEventListener('click', () => {
        closeModal(button.closest('.modal')); 
    });
});

// Закрытие окон по клику вне области
window.addEventListener('click', (event) => {
    if (event.target === loginModal) {
        closeModal(loginModal);
    }
    if (event.target === signupModal) {
        closeModal(signupModal);
    }
    if (event.target === bikeDetailModal) {
        closeModal(bikeDetailModal);
    }
    if (event.target === videoModal) {
        closeModal(videoModal);
    }
});

// --- Валидация форм ---

// Функция показа ошибки
function showError(inputElement, message) {
    const formGroup = inputElement.closest('.form-group');
    const errorElement = formGroup.querySelector('.error-message');
    inputElement.classList.add('invalid');
    errorElement.textContent = message;
}

// Функция очистки ошибки
function clearError(inputElement) {
    const formGroup = inputElement.closest('.form-group');
    const errorElement = formGroup.querySelector('.error-message');
    inputElement.classList.remove('invalid');
    // Восстанавливаем стандартное сообщение (например, для пароля)
    if (inputElement.id === 'signup-password' && !errorElement.textContent) {
         errorElement.textContent = 'Минимум 8 символов'; 
    } else if (inputElement.id !== 'signup-password') {
         errorElement.textContent = '';
    }
}

// Функция очистки всех ошибок формы
function clearErrors(form) {
    if (!form) return;
    form.querySelectorAll('input').forEach(input => {
        clearError(input);
    });
}

// --- Валидация и отправка формы входа ---
loginForm.addEventListener('submit', function(event) {
    event.preventDefault();
    clearErrors(loginForm);
    let isValid = true;

    const phoneInput = document.getElementById('login-phone');
    const passwordInput = document.getElementById('login-password');

    // Простая проверка на заполненность
    if (!phoneInput.value.trim()) {
        showError(phoneInput, 'Введите номер телефона');
        isValid = false;
    }
    // Тут можно добавить более сложную валидацию номера телефона (regex)

    if (!passwordInput.value) { // Пароль может быть и с пробелами, проверяем просто наличие
        showError(passwordInput, 'Введите пароль');
        isValid = false;
    }

    if (isValid) {
        const formData = { // Восстанавливаем объект formData
            phone: phoneInput.value.trim(),
            password: passwordInput.value
        };

        console.log('Отправка данных входа на сервер:', { phone: formData.phone });

        // Восстанавливаем fetch
        fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(async response => { // Используем async/await как в последней рабочей версии
            if (!response.ok) { 
                console.log('Ошибка от сервера (вход)! Статус:', response.status, response.statusText);
                let errorMessage = `Ошибка сервера: ${response.status} ${response.statusText}`;
                try {
                    const errData = await response.json(); 
                    console.log('Удалось прочитать тело ошибки входа как JSON:', errData);
                    if (errData && errData.message) {
                        errorMessage = errData.message;
                    }
                } catch (jsonError) {
                    console.error('Не удалось обработать тело ошибки входа как JSON:', jsonError);
                }
                throw new Error(errorMessage);
            }
            return response.json();
        })
        .then(data => {
            console.log('Ответ сервера (логин):', data);
            if (data.success && data.token) {
                // alert(data.message || 'Вход выполнен успешно!'); // Убираем alert, он не нужен
                currentUser = data.user; // Устанавливаем currentUser
                localStorage.setItem('authToken', data.token); // Сохраняем токен
                updateAuthStateUI(); // !!! ВОТ ЭТОТ ВЫЗОВ ВАЖЕН !!!
                closeModal(loginModal);
                loginForm.reset();
                clearErrors(loginForm);
            } else {
                if (!data.token) {
                    throw new Error('Сервер не вернул токен авторизации.');
                }
                throw new Error(data.message || 'Неожиданный успешный ответ без токена.');
            }
        })
        .catch(error => {
            console.error('Ошибка при входе:', error.message);
            alert(`Ошибка входа: ${error.message}`);
            localStorage.removeItem('authToken');
        });

    } else {
        console.log('Форма входа содержит ошибки.');
    }
});

// --- Валидация и отправка формы регистрации ---
signupForm.addEventListener('submit', function(event) {
    event.preventDefault();
    clearErrors(signupForm);
    let isValid = true;

    const fnameInput = document.getElementById('signup-fname');
    const lnameInput = document.getElementById('signup-lname');
    const phoneInput = document.getElementById('signup-phone');
    const emailInput = document.getElementById('signup-email');
    const passwordInput = document.getElementById('signup-password');
    const passwordConfirmInput = document.getElementById('signup-password-confirm');

    // Проверка обязательных полей
    [fnameInput, lnameInput, phoneInput, emailInput, passwordInput, passwordConfirmInput].forEach(input => {
        if (!input.value.trim()) {
            // Для паролей проверяем без trim
            if ((input === passwordInput || input === passwordConfirmInput) && !input.value) {
                 showError(input, 'Поле не должно быть пустым');
                 isValid = false;
            } else if (input !== passwordInput && input !== passwordConfirmInput) {
                showError(input, 'Поле не должно быть пустым');
                isValid = false;
            }
        }
    });

    // Проверка email (простая)
    if (emailInput.value.trim() && !/\S+@\S+\.\S+/.test(emailInput.value)) {
        showError(emailInput, 'Введите корректный email');
        isValid = false;
    }

    // Проверка длины пароля
    if (passwordInput.value && passwordInput.value.length < 8) {
        showError(passwordInput, 'Пароль должен быть не менее 8 символов');
        isValid = false;
    }

    // Проверка совпадения паролей
    if (passwordInput.value && passwordConfirmInput.value && passwordInput.value !== passwordConfirmInput.value) {
        showError(passwordConfirmInput, 'Пароли не совпадают');
        isValid = false;
    }

    if (isValid) {
        const formData = { // Восстанавливаем formData для регистрации
            fname: document.getElementById('signup-fname').value.trim(),
            lname: document.getElementById('signup-lname').value.trim(),
            phone: document.getElementById('signup-phone').value.trim(),
            email: document.getElementById('signup-email').value.trim(),
            password: document.getElementById('signup-password').value,
            password_confirm: document.getElementById('signup-password-confirm').value
        };

        console.log('Отправка данных регистрации на сервер:', formData);

        // Восстанавливаем fetch для регистрации
        fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
        .then(async response => {
            if (!response.ok) {
                console.log('Ошибка от сервера! Статус:', response.status, response.statusText);
                let errorMessage = `Ошибка сервера: ${response.status} ${response.statusText}`;
                try {
                    const errData = await response.json(); 
                    console.log('Удалось прочитать тело ошибки как JSON:', errData);
                    if (errData && errData.message) {
                        errorMessage = errData.message;
                    }
                } catch (jsonError) {
                    console.error('Не удалось обработать тело ошибки как JSON:', jsonError);
                }
                throw new Error(errorMessage);
            }
            return response.json();
        })
        .then(data => {
            console.log('Ответ сервера (регистрация):', data);
            alert(data.message || 'Регистрация прошла успешно!');
            closeModal(signupModal);
            signupForm.reset(); 
            clearErrors(signupForm); 
            openModal(loginModal); 
        })
        .catch(error => {
            console.error('Ошибка при регистрации:', error.message);
            alert(`Ошибка регистрации: ${error.message}`);
        });

    } else {
        console.log('Форма регистрации содержит ошибки.');
    }
});

// Дополнительно: очистка ошибок при вводе
signupForm.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => clearError(input));
});
loginForm.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => clearError(input));
});

// --- Логика для каталога и деталей велосипеда ---

bikeCards.forEach(card => {
    card.addEventListener('click', () => {
        // Получаем данные из атрибутов
        const name = card.dataset.name;
        const imgArray = JSON.parse(card.dataset.img || '[]'); // Парсим массив картинок
        const desc = card.dataset.desc;
        const specs = JSON.parse(card.dataset.specs || '{}');
        const priceInfo = JSON.parse(card.dataset.priceInfo || '{}');

        // Заполняем модальное окно
        modalBikeTitle.textContent = name;
        modalBikeDesc.textContent = desc;

        // Инициализация карусели
        currentImages = imgArray;
        currentImageIndex = 0;
        updateCarousel();

        // Заполняем характеристики
        modalBikeSpecsList.innerHTML = ''; // Очищаем старые
        for (const key in specs) {
            const li = document.createElement('li');
            const keySpan = document.createElement('span');
            const valueSpan = document.createElement('span');
            keySpan.textContent = key + ':';
            valueSpan.textContent = specs[key];
            li.appendChild(keySpan);
            li.appendChild(valueSpan);
            modalBikeSpecsList.appendChild(li);
        }

        // Заполняем опции аренды и цены
        currentPriceInfo = priceInfo;
        modalRentDurationDiv.innerHTML = ''; // Очищаем старые опции
        modalCurrentPriceStrong.textContent = '---'; // Сбрасываем цену
        let firstOption = true;
         for (const duration in priceInfo) {
            const price = priceInfo[duration];
            const inputId = `duration-${duration.replace(/\s+/g, '-')}`; // Генерируем ID

            const radioInput = document.createElement('input');
            radioInput.type = 'radio';
            radioInput.id = inputId;
            radioInput.name = 'rent-duration';
            radioInput.value = duration;
            if (firstOption) {
                radioInput.checked = true; // Выбираем первую опцию по умолчанию
                updatePriceDisplay(duration); // Обновляем цену для первой опции
                firstOption = false;
            }

            const label = document.createElement('label');
            label.htmlFor = inputId;
            label.textContent = duration;

            modalRentDurationDiv.appendChild(radioInput);
            modalRentDurationDiv.appendChild(label);
        }

        // Открываем модальное окно
        openModal(bikeDetailModal);
    });
});

// Функция обновления карусели
function updateCarousel() {
    if (currentImages.length > 0) {
        modalBikeImage.src = currentImages[currentImageIndex];
        modalBikeImage.alt = modalBikeTitle.textContent + ` (Фото ${currentImageIndex + 1} из ${currentImages.length})`;

        carouselPrevBtn.disabled = currentImageIndex === 0;
        carouselNextBtn.disabled = currentImageIndex === currentImages.length - 1;
        
        carouselPrevBtn.style.display = currentImages.length > 1 ? 'block' : 'none';
        carouselNextBtn.style.display = currentImages.length > 1 ? 'block' : 'none';

        // Обновление точек
        carouselDotsContainer.innerHTML = ''; // Очищаем старые точки
        if (currentImages.length > 1) {
            currentImages.forEach((_, index) => {
                const dot = document.createElement('button'); // Используем button для доступности
                dot.classList.add('dot');
                dot.setAttribute('aria-label', `Фото ${index + 1}`);
                if (index === currentImageIndex) {
                    dot.classList.add('active');
                    dot.setAttribute('aria-current', 'true');
                }
                dot.addEventListener('click', () => {
                    currentImageIndex = index;
                    updateCarousel();
                });
                carouselDotsContainer.appendChild(dot);
            });
            carouselDotsContainer.style.display = 'flex';
        } else {
            carouselDotsContainer.style.display = 'none'; // Скрываем точки, если картинка одна
        }
    } else {
        // Если картинок нет (маловероятно, но на всякий случай)
        modalBikeImage.src = 'https://placehold.co/600x400/ccc/999?text=Нет+фото';
        carouselPrevBtn.style.display = 'none';
        carouselNextBtn.style.display = 'none';
    }
}

// Обработчики кнопок карусели
carouselPrevBtn.addEventListener('click', () => {
    if (currentImageIndex > 0) {
        currentImageIndex--;
        updateCarousel();
    }
});

carouselNextBtn.addEventListener('click', () => {
    if (currentImageIndex < currentImages.length - 1) {
        currentImageIndex++;
        updateCarousel();
    }
});

// Функция обновления отображения цены
function updatePriceDisplay(selectedDuration) {
    if (currentPriceInfo[selectedDuration]) {
        modalCurrentPriceStrong.textContent = `${currentPriceInfo[selectedDuration]} ₽`;
    } else {
        modalCurrentPriceStrong.textContent = '---';
    }
}

// Обработчик изменения выбора срока аренды
modalRentDurationDiv.addEventListener('change', (event) => {
    if (event.target.type === 'radio' && event.target.name === 'rent-duration') {
        updatePriceDisplay(event.target.value);
    }
});

// --- Конец логики модальных окон --- 

// --- Логика для пасхалки "приколы" ---

const easterEggContainer = document.getElementById('easter-egg');
const secretWord = 'приколы';
let typedSequence = '';
const sequenceMaxLength = secretWord.length;

// Обработчик нажатия клавиш
document.addEventListener('keyup', (event) => {
    // Игнорируем ввод, если фокус на input, textarea или select
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'SELECT')) {
        // Если фокус на поле пасхалки, сбросим последовательность, чтобы снова не сработало
        if (activeElement.id === 'easter-input') {
            typedSequence = '';
        }
        return;
    }
    
    // Получаем нажатую клавишу в нижнем регистре
    const key = event.key.toLowerCase();

    // Добавляем символ к последовательности, если это одна буква
    if (key.length === 1 && key.match(/[а-яёa-z]/i)) { // Проверяем, что это буква (кириллица или латиница)
        typedSequence += key;
    } else {
        // Сбрасываем последовательность при нажатии других клавиш (Enter, Shift и т.д.)
        typedSequence = '';
        return; // Не продолжаем проверку
    }

    // Обрезаем последовательность до нужной длины
    if (typedSequence.length > sequenceMaxLength) {
        typedSequence = typedSequence.slice(-sequenceMaxLength);
    }

    // Проверяем совпадение
    if (typedSequence === secretWord) {
        console.log('Пасхалка активирована!');
        if (easterEggContainer) {
            easterEggContainer.style.display = 'flex';
        }
        // Можно добавить фокус на поле ввода:
        // const easterInput = document.getElementById('easter-input');
        // if (easterInput) easterInput.focus();
        
        typedSequence = ''; // Сбрасываем, чтобы не срабатывало повторно сразу
    }
});

// Пример действия для кнопки "Го" (можно доработать)
const easterBtn = document.getElementById('easter-btn');
const easterInput = document.getElementById('easter-input');
const videoModal = document.getElementById('video-modal'); // Ссылка на модалку видео
const easterVideo = document.getElementById('easter-video'); // Ссылка на видео элемент

// Расширим closeModal, чтобы останавливать видео при закрытии
const originalCloseModal = closeModal; // Сохраняем оригинальную функцию
closeModal = function(modal) {
    originalCloseModal(modal); // Вызываем оригинальную логику
    if (modal === videoModal && easterVideo) {
        easterVideo.pause(); // Ставим видео на паузу
        easterVideo.currentTime = 0; // Сбрасываем на начало
        easterVideo.src = ''; // Очищаем src, чтобы освободить ресурсы
    }
}

// Обновляем действие для кнопки "Го"
if (easterBtn && easterInput && videoModal && easterVideo) {
    easterBtn.addEventListener('click', () => {
        const inputText = easterInput.value.trim().toLowerCase();
        
        if (inputText === 'washing machine') {
            console.log('Запускаем видео Washing Machine!');
            easterVideo.src = 'prikoli/VID_20241031_093817.mp4'; // Устанавливаем источник
            openModal(videoModal); // Открываем модалку с видео
            // Пытаемся запустить воспроизведение
            easterVideo.play().catch(error => {
                // Обработка ошибки, если автоплей запрещен браузером
                console.warn("Autoplay был предотвращен браузером:", error);
                // Можно показать кнопку Play или попросить пользователя кликнуть для старта
            });
        } else {
            // Если введено что-то другое, можно вывести стандартный alert или ничего не делать
            alert(`Запрос "${easterInput.value}" не является секретным кодом для видео ;)`);
        }
    });
} else {
    console.error('Не удалось найти все элементы для пасхалки с видео.');
} 

// --- Логика для FAQ Аккордеона ---
document.addEventListener('DOMContentLoaded', () => {
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.closest('.faq-item');
            // Просто переключаем класс active у текущего элемента
            item.classList.toggle('active');

            // Опционально: закрыть другие открытые ответы (если нужно)
            /*
            if (item.classList.contains('active')) {
                faqQuestions.forEach(otherQuestion => {
                    const otherItem = otherQuestion.closest('.faq-item');
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                    }
                });
            }
            */
        });
    });
}); 