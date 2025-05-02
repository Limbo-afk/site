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
const modalRentDurationDiv = document.getElementById('modal-rent-duration');
const modalCurrentPriceStrong = document.getElementById('modal-current-price');
const carouselPrevBtn = document.getElementById('carousel-prev');
const carouselNextBtn = document.getElementById('carousel-next');
const carouselDotsContainer = document.getElementById('carousel-dots-container');

// Переменные для состояния карусели и цен
let currentImages = [];
let currentImageIndex = 0;
let currentPriceInfo = {};

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