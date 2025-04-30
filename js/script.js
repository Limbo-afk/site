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

    // Массив с данными о точках проката
    const bikeStations = [
        { 
            coords: [53.1817, 50.1135], 
            location: 'Железнодорожный вокзал Самары', 
            name: 'Альфа' 
        },
        { 
            coords: [53.2167, 50.1694], // Примерные координаты Фабрики-кухни (Третьяковки)
            location: 'Государственная Третьяковская галерея, Третьяковка в Самаре', 
            name: 'Бета' 
        },
        { 
            coords: [53.2305, 50.1930], 
            location: 'Парк культуры и отдыха имени Ю. А. Гагарина', 
            name: 'Гамма' 
        },
        { 
            coords: [53.2667, 50.2786], // Примерные координаты Парка Металлургов
            location: 'Парк 50-летия Октября', 
            name: 'Дельта' 
        },
        { 
            coords: [53.212434, 50.248667], // Точные координаты от пользователя
            location: 'Метро Безымянка', // Оставим пока это название
            name: 'Эпсилон' 
        }
    ];

    const workHours = '8:00 - 20:00';

    // Добавление меток (placemarks) на карту
    bikeStations.forEach(station => {
        const placemark = new ymaps.Placemark(station.coords, {
            // Содержимое балуна (всплывающего окна)
            balloonContentHeader: `Велопрокат "${station.name}"`, // Название точки в заголовке
            balloonContentBody: 
                `<strong>Место:</strong> ${station.location}<br>` + // Адрес/место
                `<strong>График работы:</strong> ${workHours}`, // График работы
            // Содержимое хинта (при наведении)
            hintContent: `Велопрокат "${station.name}"`
        }, {
            preset: 'islands#blueBicycleIcon' 
        });
        myMap.geoObjects.add(placemark);
    });

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

// Открытие окон по кнопкам
loginBtn.addEventListener('click', () => openModal(loginModal));
signupBtn.addEventListener('click', () => openModal(signupModal));

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

// Валидация формы входа
loginForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Отменяем стандартную отправку
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
        console.log('Форма входа валидна. Отправка данных...', {
            phone: phoneInput.value,
            password: passwordInput.value
        });
        // !!! Здесь в будущем будет реальная отправка данных на сервер
        alert('Вход выполнен (симуляция)!');
        closeModal(loginModal);
        // Тут можно обновить интерфейс (например, скрыть кнопки Вход/Регистрация и показать имя пользователя)
    } else {
        console.log('Форма входа содержит ошибки.');
    }
});

// Валидация формы регистрации
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
        console.log('Форма регистрации валидна. Отправка данных...', {
            fname: fnameInput.value,
            lname: lnameInput.value,
            phone: phoneInput.value,
            email: emailInput.value,
            // Пароль в реальном приложении так не передают!
        });
        // !!! Здесь в будущем будет реальная отправка данных на сервер
        alert('Регистрация успешна (симуляция)!');
        closeModal(signupModal);
        // Тут можно автоматически выполнить вход или предложить войти
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
        const img = card.dataset.img;
        const desc = card.dataset.desc;
        const specs = JSON.parse(card.dataset.specs || '{}');
        const priceInfo = JSON.parse(card.dataset.priceInfo || '{}');

        // Заполняем модальное окно
        modalBikeTitle.textContent = name;
        modalBikeImage.src = img;
        modalBikeImage.alt = name;
        modalBikeDesc.textContent = desc;

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

        // Заполняем цены (просто списком)
        modalBikePricingDiv.innerHTML = ''; // Очищаем старые
         for (const key in priceInfo) {
            const p = document.createElement('p');
            p.textContent = `${key}: ${priceInfo[key]}`;
            modalBikePricingDiv.appendChild(p);
        }

        // Открываем модальное окно
        openModal(bikeDetailModal);
    });
});

// --- Конец логики модальных окон --- 