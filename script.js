const USERS_KEY = 'app_users';
const CURRENT_USER_KEY = 'app_current_user';
const BOOKINGS_KEY = 'app_bookings';

(function init() {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    if (users.length === 0) {
        users.push({ id: 1, login: 'user', email: 'user@mail.ru', password: '123' });
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    
    const user = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null');
    const userNameSpan = document.getElementById('userName');
    if (userNameSpan && user) {
        userNameSpan.textContent = ` ${user.login}`;
    }
    
    if (window.location.pathname.includes('yourbooking.html')) {
        renderBookings();
    }
})();

function handleRegistration() {
  const login = document.getElementById('login').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirm = document.getElementById('confirm_password').value;
  const errorDiv = document.getElementById('errorMessage');
  const successDiv = document.getElementById('successMessage');
  
  if (errorDiv) errorDiv.style.display = 'none';
  if (successDiv) successDiv.style.display = 'none';
  
  if (!login || !email || !password || !confirm) {
      if (errorDiv) {
          errorDiv.textContent = 'Заполните все поля';
          errorDiv.style.display = 'block';
      }
      return;
  }
  if (password !== confirm) {
      if (errorDiv) {
          errorDiv.textContent = 'Пароли не совпадают';
          errorDiv.style.display = 'block';
      }
      return;
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
      if (errorDiv) {
          errorDiv.textContent = 'Введите корректный email (например: user@mail.ru)';
          errorDiv.style.display = 'block';
      }
      return;
  }
  if (password.length < 8) {
      if (errorDiv) {
          errorDiv.textContent = 'Пароль должен быть не менее 8 символов';
          errorDiv.style.display = 'block';
      }
      return;
  }
  
  const hasLetters = /[a-zA-Zа-яА-Я]/.test(password); 
  const hasNumbers = /[0-9]/.test(password);
  
  if (!hasLetters || !hasNumbers) {
      if (errorDiv) {
          errorDiv.textContent = 'Пароль должен содержать и буквы, и цифры';
          errorDiv.style.display = 'block';
      }
      return;
  }
  
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  
  if (users.find(u => u.login === login)) {
      if (errorDiv) {
          errorDiv.textContent = 'Логин уже существует';
          errorDiv.style.display = 'block';
      }
      return;
  }
  if (users.find(u => u.email === email)) {
      if (errorDiv) {
          errorDiv.textContent = 'Email уже используется';
          errorDiv.style.display = 'block';
      }
      return;
  }
  users.push({
      id: Date.now(),
      login: login,
      email: email,
      password: password
  });
  
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  if (successDiv) {
      successDiv.textContent = 'Регистрация успешна! Теперь войдите';
      successDiv.style.display = 'block';
  }
  
  document.getElementById('login').value = '';
  document.getElementById('email').value = '';
  document.getElementById('password').value = '';
  document.getElementById('confirm_password').value = '';
}

function handleLogin() {  
    const login = document.getElementById('login').value.trim();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('errorMessage');
    
    if (!login || !password) {
        if (errorDiv) {
            errorDiv.textContent = 'Заполните все поля';
            errorDiv.style.display = 'block';
        }
        return;
    }
    
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find(u => (u.login === login || u.email === login) && u.password === password);
    
    if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ id: user.id, login: user.login }));
        showMessage('Вход выполнен успешно!');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    } else {
        if (errorDiv) {
            errorDiv.textContent = 'Неверный логин или пароль';
            errorDiv.style.display = 'block';
        }
    }
}

function logout() { 
    localStorage.removeItem(CURRENT_USER_KEY);
    showMessage('Вы вышли из системы');
    setTimeout(() => {
        window.location.href = 'entrance.html';
    }, 500);
}

let pendingBooking = null;

function registerForClass(name, price, time) {  
    const user = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null');
    
    if (!user) {
        showMessage('Сначала войдите в систему', true);
        setTimeout(() => {
            window.location.href = 'entrance.html';
        }, 1000);
        return;
    }
    
    pendingBooking = {
        className: name,
        price: price,
        time: time,
        date: new Date(Date.now() + 86400000).toLocaleDateString('ru-RU')
    };
    
    const modalMsg = document.getElementById('modalMessage');
    if (modalMsg) {
        modalMsg.innerHTML = `Запись на <strong>${name}</strong><br>Дата: завтра, ${time}<br>Стоимость: ${price} ₽`;
        document.getElementById('modal').style.display = 'flex';
    }
}

function confirmBooking() { 
    if (!pendingBooking) return;
    
    const user = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null');
    if (!user) return;
    
    const bookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
    
    bookings.push({
        ...pendingBooking,
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        userId: user.id
    });
    
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    showMessage(` Запись на ${pendingBooking.className} оформлена`);
    pendingBooking = null;
    closeModal();
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) modal.style.display = 'none';
    pendingBooking = null;
}

function renderBookings() { 
    const user = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null');
    
    if (!user) {
        window.location.href = 'entrance.html';
        return;
    }
    
    const allBookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
    const myBookings = allBookings.filter(b => b.userId === user.id);
    
    const container = document.getElementById('bookingsContainer');
    if (!container) return;
    
    const icons = { 'Йога': '🧘', 'Здоровая спина': '💪', 'Пилатес': '🎯', 'Растяжка': '🦵' };
    
    container.innerHTML = myBookings.map(b => `
        <div class="booking-card">
            <div class="booking-header">
                <div class="booking-icon">${icons[b.className] || '🏋️'}</div>
                <div class="booking-title">
                    <h3>${b.className}</h3>
                </div>
            </div>
            <div class="booking-details">
                <div class="detail-row"><span class="detail-label"> Дата</span><span class="detail-value">${b.date}</span></div>
                <div class="detail-row"><span class="detail-label"> Время</span><span class="detail-value">${b.time}</span></div>
                <div class="detail-row"><span class="detail-label">Стоимость</span><span class="detail-value price">${b.price} ₽</span></div>
            </div>
            <button class="btn-cancel-booking" onclick="cancelBooking('${b.id}')">Отменить запись</button>
        </div>
    `).join('');
}

function cancelBooking(bookingId) {  
    const user = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null');
    if (!user) return;
    
    const bookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
    const filteredBookings = bookings.filter(b => !(b.id === bookingId && b.userId === user.id));
    
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(filteredBookings));
    showMessage(' Запись отменена');
    renderBookings();  
}

function goToBookings() {
    window.location.href = 'yourbooking.html';
}

function goToClasses() {
    window.location.href = 'index.html';
}

function showMessage(text, isError = false) {
    const notif = document.getElementById('notification');
    if (!notif) {
        alert(text);
        return;
    }
    notif.textContent = text;
    notif.classList.add('show');
    notif.style.backgroundColor = isError ? '#dc2626' : '#10b981';
    setTimeout(() => notif.classList.remove('show'), 3000);
}

window.onclick = (e) => {
    if (e.target === document.getElementById('modal')) {
        closeModal();
    }
};