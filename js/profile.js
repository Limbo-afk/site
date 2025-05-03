document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');

    // Получаем элементы формы
    const profileForm = document.getElementById('profile-form');
    const profileFnameInput = document.getElementById('profile-fname');
    const profileLnameInput = document.getElementById('profile-lname');
    const profileEmailInput = document.getElementById('profile-email');
    const profilePatronymicInput = document.getElementById('profile-patronymic'); // Добавили отчество
    // const logoutButton = document.getElementById('logout-button'); // Старой кнопки нет

    const saveButton = document.getElementById('save-profile-button');
    const deleteButton = document.getElementById('delete-profile-button');

    if (!token) {
        // Если токена нет, возможно, стоит перенаправить на главную или показать сообщение
        console.error('Токен не найден, пользователь не авторизован.');
        // window.location.href = 'index.html'; // Пример редиректа
        return; 
    }

    console.log('Найден токен, запрашиваем профиль...');
    
    try {
        const response = await fetch('/api/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();

            // Отображаем данные в левой колонке ("display fields")
            document.getElementById('current-fname').textContent = data.fname || 'Не указано';
            document.getElementById('current-lname').textContent = data.lname || 'Не указано';
            document.getElementById('current-patronymic').textContent = data.patronymic || 'Не указано'; // Новое поле
            document.getElementById('current-email').textContent = data.email || 'Не указано';
            const contactMethodDisplay = data.contact_method === 'whatsapp' ? 'WhatsApp' : (data.contact_method === 'phone' ? 'Телефон' : 'Не указано');
            document.getElementById('current-contact-method').textContent = contactMethodDisplay; // Новое поле

            // Заполняем поля формы редактирования в правой колонке
            document.getElementById('profile-fname').value = data.fname || '';
            document.getElementById('profile-lname').value = data.lname || '';
            document.getElementById('profile-patronymic').value = data.patronymic || ''; // Новое поле
            document.getElementById('profile-email').value = data.email || '';

            // Выбираем правильную радиокнопку
            const contactMethod = data.contact_method || 'phone'; // По умолчанию телефон
            const radioToCheck = document.querySelector(`input[name="contact-method"][value="${contactMethod}"]`);
            if (radioToCheck) {
                radioToCheck.checked = true;
            } else {
                // Если значение некорректно, выбираем телефон по умолчанию
                document.querySelector('input[name="contact-method"][value="phone"]').checked = true;
            }

            // Устанавливаем состояния чекбоксов (если они хранятся)
            // Пока предполагаем, что согласие на маркетинг хранится как data.marketing_consent (boolean)
            document.getElementById('marketing-consent').checked = !!data.marketing_consent;

            // Обязательные чекбоксы политики и обработки данных НЕ должны быть предзаполнены
            // Они требуют явного согласия при каждом сохранении (обычно)
            // document.getElementById('privacy-policy').checked = false; // или как было реализовано
            // document.getElementById('data-processing').checked = false; // или как было реализовано

            // Можно обновить title страницы
            document.title = `Профиль ${data.fname || ''} - Велопрокат`;

            // *** Вызываем отрисовку шапки ***
            renderHeaderProfileIcon(data);
        } else if (response.status === 401 || response.status === 403) {
            // Неавторизован или неверный токен - удаляем токен и просим войти снова
            console.error('Ошибка авторизации при загрузке профиля');
            localStorage.removeItem('authToken');
            alert('Сессия истекла или недействительна. Пожалуйста, войдите снова.');
            window.location.href = 'index.html'; // Перенаправляем на главную
        } else {
             // Другие ошибки сервера
            console.error('Ошибка при загрузке данных профиля:', response.status);
             alert('Не удалось загрузить данные профиля. Попробуйте обновить страницу.');
             // Можно отобразить сообщение об ошибке на странице
        }
    } catch (error) {
        console.error('Сетевая ошибка или ошибка выполнения при загрузке профиля:', error);
        alert('Произошла ошибка при загрузке профиля. Проверьте подключение к сети.');
        // Можно отобразить сообщение об ошибке на странице
    }

    // Обработчик сохранения формы
    if (profileForm) {
        profileForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            // Сбор данных из формы...
            const formData = {
                fname: document.getElementById('profile-fname').value,
                lname: document.getElementById('profile-lname').value,
                patronymic: document.getElementById('profile-patronymic').value,
                email: document.getElementById('profile-email').value,
                contact_method: document.querySelector('input[name="contact-method"]:checked').value,
                marketing_consent: document.getElementById('marketing-consent').checked,
                // Добавить сюда другие поля, если они отправляются на сервер
            };

            // Валидация обязательных чекбоксов перед отправкой
            const privacyPolicyChecked = document.getElementById('privacy-policy').checked;
            const dataProcessingChecked = document.getElementById('data-processing').checked;

            if (!privacyPolicyChecked || !dataProcessingChecked) {
                alert('Пожалуйста, подтвердите согласие с Политикой Конфиденциальности и Согласие на обработку персональных данных.');
                // Можно подсветить незаполненные чекбоксы
                return; // Прерываем отправку
            }

            // Отправка данных на сервер...
            try {
                const saveResponse = await fetch('/api/profile/update', { // Убедись, что URL правильный
                    method: 'PUT', // Или POST, в зависимости от API
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                });

                if (saveResponse.ok) {
                    const updatedData = await saveResponse.json();
                    alert('Данные профиля успешно обновлены!');

                    // Обновляем отображаемые данные в левой колонке
                    document.getElementById('current-fname').textContent = updatedData.fname || 'Не указано';
                    document.getElementById('current-lname').textContent = updatedData.lname || 'Не указано';
                    document.getElementById('current-patronymic').textContent = updatedData.patronymic || 'Не указано';
                    document.getElementById('current-email').textContent = updatedData.email || 'Не указано';
                    const updatedContactMethodDisplay = updatedData.contact_method === 'whatsapp' ? 'WhatsApp' : (updatedData.contact_method === 'phone' ? 'Телефон' : 'Не указано');
                    document.getElementById('current-contact-method').textContent = updatedContactMethodDisplay;

                     // Сбрасываем обязательные чекбоксы после успешного сохранения
                     document.getElementById('privacy-policy').checked = false;
                     document.getElementById('data-processing').checked = false;

                } else {
                     console.error('Ошибка при сохранении профиля:', saveResponse.status);
                     const errorData = await saveResponse.text(); // Попытаться получить текст ошибки
                     alert(`Не удалось сохранить данные профиля. Ошибка: ${saveResponse.status}. ${errorData}`);
                }
            } catch (error) {
                console.error('Сетевая ошибка или ошибка выполнения при сохранении профиля:', error);
                alert('Произошла ошибка при сохранении профиля.');
            }
        });
    }

    // Обработчик удаления профиля (если есть кнопка)
    if (deleteButton) {
        deleteButton.addEventListener('click', async () => {
            if (confirm('Вы уверены, что хотите удалить свой профиль? Это действие необратимо.')) {
                try {
                    const deleteResponse = await fetch('/api/profile/delete', { // Убедись, что URL правильный
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (deleteResponse.ok) {
                        alert('Профиль успешно удален.');
                        localStorage.removeItem('authToken');
                        window.location.href = 'index.html'; // Перенаправляем на главную
                    } else {
                        console.error('Ошибка при удалении профиля:', deleteResponse.status);
                        const errorData = await deleteResponse.text();
                        alert(`Не удалось удалить профиль. Ошибка: ${deleteResponse.status}. ${errorData}`);
                    }
                } catch (error) {
                    console.error('Сетевая ошибка или ошибка выполнения при удалении профиля:', error);
                    alert('Произошла ошибка при удалении профиля.');
                }
            }
        });
    }

    // --- Код выхода пользователя --- (если еще не добавлен)
    const logoutButton = document.getElementById('logout-button'); // Убедись, что ID правильный
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            alert('Вы вышли из системы.');
            window.location.href = 'index.html'; // Перенаправление на главную
        });
    } else {
        // Кнопка выхода может динамически добавляться в header в script.js
        // Проверим, есть ли она в header
        const headerLogoutButton = document.querySelector('#auth-buttons #logout-button'); 
        if (headerLogoutButton) {
             headerLogoutButton.addEventListener('click', () => {
                localStorage.removeItem('authToken');
                alert('Вы вышли из системы.');
                window.location.href = 'index.html'; 
            });
        }
    }

    // --- Новая функция для отрисовки иконки/меню профиля в шапке ---
    function renderHeaderProfileIcon(user) {
        const authButtonsDiv = document.getElementById('auth-buttons');
        if (!authButtonsDiv || !user) return; // Проверка

        authButtonsDiv.innerHTML = ''; // Очищаем

        // 1. Контейнер
        const profileContainer = document.createElement('div');
        profileContainer.style.position = 'relative';
        profileContainer.style.display = 'inline-block';

        // 2. Триггер (иконка)
        const profileTrigger = document.createElement('a');
        profileTrigger.href = '#'; // Можно сделать ссылкой на profile.html, если нужно
        profileTrigger.title = `Профиль (${user.fname})`;
        profileTrigger.style.display = 'inline-block';
        profileTrigger.style.verticalAlign = 'middle';
        profileTrigger.id = 'profile-icon-trigger';
        
        const profileIcon = document.createElement('img');
        profileIcon.src = 'img/profile.png'; // Путь к иконке
        profileIcon.alt = 'Профиль';
        profileIcon.style.width = '30px'; 
        profileIcon.style.height = '30px';
        profileIcon.style.verticalAlign = 'middle';
        profileIcon.style.cursor = 'pointer';
        profileTrigger.appendChild(profileIcon);

        // 3. Выпадающее меню
        const dropdownMenu = document.createElement('div');
        dropdownMenu.classList.add('profile-dropdown-menu');
        dropdownMenu.style.display = 'none'; 
        
        dropdownMenu.innerHTML = `
            <div class="dropdown-item bonus-info">
                <span class="icon">👤</span>
                Мой бонусный счёт: <strong>0 ₽</strong>
            </div>
            <a href="profile.html" class="dropdown-item">
                <span class="icon">📝</span>
                Персональные данные
            </a>
            <div class="dropdown-item disabled">
                 <span class="icon">🎁</span> Мои бонусы
            </div>
             <div class="dropdown-item disabled">
                 <span class="icon">💳</span> Банковские карты
            </div>
            <hr>
            <div class="dropdown-item city-info">Город: <strong>Самара</strong></div>
            <hr>
            <a href="#" class="dropdown-item static-link">Договор на использование сервиса</a>
            <a href="#" class="dropdown-item static-link">Политика конфиденциальности</a>
            <a href="#" class="dropdown-item static-link">Согласие на обработку данных</a>
            <hr>
        `;

        // 4. Кнопка Выход
        const logoutBtn = document.createElement('button');
        logoutBtn.textContent = 'Выход';
        logoutBtn.classList.add('dropdown-item', 'logout-btn-dropdown');
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            window.location.href = 'index.html'; // Редирект на главную после выхода
            console.log('Пользователь вышел');
        });
        dropdownMenu.appendChild(logoutBtn);

        // 5. Сборка и добавление
        profileContainer.appendChild(profileTrigger);
        profileContainer.appendChild(dropdownMenu);
        authButtonsDiv.appendChild(profileContainer);
        authButtonsDiv.style.visibility = 'visible'; // Делаем видимым

        // 6. Логика ховера
        let hideTimeout;
        profileContainer.addEventListener('mouseenter', () => {
            clearTimeout(hideTimeout);
            dropdownMenu.style.display = 'block';
        });
        profileContainer.addEventListener('mouseleave', () => {
            hideTimeout = setTimeout(() => { dropdownMenu.style.display = 'none'; }, 300);
        });
    }
    // --- Конец новой функции ---
}); 