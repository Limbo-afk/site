document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    const profileFname = document.getElementById('profile-fname');
    const profileLname = document.getElementById('profile-lname');
    const profileEmail = document.getElementById('profile-email');
    // const profilePhone = document.getElementById('profile-phone'); // Пока не используем
    const logoutButton = document.getElementById('logout-button');

    if (!token) {
        // Если токена нет, немедленно перенаправляем на главную
        console.log('Токен не найден, перенаправление на главную...');
        window.location.href = 'index.html'; 
        return; // Прекращаем выполнение скрипта
    }

    console.log('Найден токен, запрашиваем профиль...');
    
    // Запрашиваем данные профиля с сервера
    fetch('/api/profile', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(async response => {
        if (!response.ok) {
            console.error('Ошибка получения профиля. Статус:', response.status);
            // Пытаемся прочитать тело ошибки
            let errorDetail = `Ошибка сервера: ${response.status}`;
            try {
                const errData = await response.json();
                if (errData && errData.message) {
                    errorDetail = errData.message;
                }
            } catch (e) { /* Игнорируем ошибку парсинга */ }
            
            // Если ошибка авторизации (401/403), удаляем токен и редиректим
            if (response.status === 401 || response.status === 403) {
                console.log('Токен недействителен или срок истек. Удаляем токен.');
                localStorage.removeItem('authToken');
                window.location.href = 'index.html';
            }
            throw new Error(`Не удалось загрузить профиль: ${errorDetail}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Профиль успешно загружен:', data);
        if (data.success && data.userData) {
            const user = data.userData;
            profileFname.textContent = user.firstName || 'Не указано';
            profileLname.textContent = user.lastName || 'Не указано'; // Добавляем lastName
            profileEmail.textContent = user.email || 'Не указано';
            // profilePhone.textContent = user.phone || 'Не указано'; // Когда раскомментируем в HTML
            
            // Можно обновить title страницы
            document.title = `Профиль ${user.firstName} - Велопрокат`;
        } else {
            throw new Error(data.message || 'Не удалось получить данные пользователя из ответа.');
        }
    })
    .catch(error => {
        console.error('Ошибка при загрузке или обработке профиля:', error.message);
        // Если произошла любая другая ошибка, тоже лучше выйти и перенаправить
        // localStorage.removeItem('authToken'); // Не удаляем токен здесь, если ошибка не 401/403
        // window.location.href = 'index.html'; 
        // Вместо редиректа покажем сообщение об ошибке
        alert('Не удалось загрузить данные профиля. Попробуйте войти снова.');
        // Скроем информацию о пользователе, если она не загрузилась
        const profileInfoDiv = document.querySelector('.profile-info');
        if (profileInfoDiv) {
            profileInfoDiv.innerHTML = '<p>Не удалось загрузить данные.</p>';
        }
    });

    // Обработчик кнопки выхода
    if(logoutButton) {
        logoutButton.addEventListener('click', () => {
            console.log('Нажата кнопка Выход');
            localStorage.removeItem('authToken');
            console.log('Токен удален');
            window.location.href = 'index.html'; // Перенаправляем на главную
        });
    }
}); 