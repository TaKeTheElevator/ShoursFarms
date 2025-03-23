const tg = window.Telegram.WebApp;

// Статические данные об аккаунтах
const accounts = ["Main", "main2", "main3", "main4", "bot1"];

// Данные о текущем аккаунте
let currentAccount = null;

// Отображение списка аккаунтов
document.addEventListener("DOMContentLoaded", function () {
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    document.getElementById('theme-toggle').innerHTML = '🌙';
  } else {
    document.body.classList.remove('dark-mode');
    document.getElementById('theme-toggle').innerHTML = '🌞';
  }
  displayAccounts();
});

// Функция для отображения списка аккаунтов
function displayAccounts() {
  const accountsContainer = document.getElementById("accounts");
  accountsContainer.innerHTML = ''; // Очистить предыдущие аккаунты

  accounts.forEach(account => {
    const accountDiv = document.createElement('div');
    accountDiv.classList.add('account');
    accountDiv.innerHTML = `
      <div class="account-item">
        <img src="https://avatars.akamai.steamstatic.com/${account}_full.jpg" alt="${account}" class="avatar" />
        <button onclick="showBotInfo('${account}')">${account}</button>
      </div>
    `;
    accountsContainer.appendChild(accountDiv);
  });
}

// Функция для отображения информации об аккаунте
async function showBotInfo(account) {
  currentAccount = account;
  document.getElementById('accounts').style.display = 'none';
  document.getElementById('bot-info').style.display = 'block';

  // Получаем данные для выбранного аккаунта
  const botData = await getBotData(account);

  const avatarUrl = `https://avatars.akamai.steamstatic.com/${botData.AvatarHash}_full.jpg`;
  const statusText = botData.KeepRunning ? "🟢 Онлайн" : "🔴 Оффлайн";
  const balance = botData.WalletBalance;
  const games = botData.BotConfig.GamesPlayedWhileIdle.join(", ") || "Нет игр";

  document.getElementById('avatar').src = avatarUrl;
  document.getElementById('status').innerText = `Статус: ${statusText}`;
  document.getElementById('nickname').innerText = `Ник: ${botData.Nickname}`;
  document.getElementById('gameInfo').innerText = `Игры: ${games}`;
  document.getElementById('playtime').innerText = `Баланс: ${balance}`;

  const statusIndicator = document.getElementById("statusIndicator");
  statusIndicator.classList.remove('offline', 'online');
  statusIndicator.classList.add(botData.KeepRunning ? 'online' : 'offline');

  // Функционал кнопок
  document.getElementById('startButton').onclick = () => toggleBotStatus(account, true);
  document.getElementById('stopButton').onclick = () => toggleBotStatus(account, false);
  document.getElementById('changeStatusButton').onclick = () => changeStatus(account);
}

// Функция для получения данных об аккаунте
async function getBotData(account) {
  const response = await fetch(`http://46.8.21.39:1242/Api/Bot/${account}`);
  const data = await response.json();
  return data.Result[account];
}

// Функция для переключения статуса бота
async function toggleBotStatus(account, start) {
  const response = await fetch(`http://46.8.21.39:1242/Api/Bot/${account}/${start ? 'Start' : 'Stop'}`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic 102030'
    }
  });
  const data = await response.json();
  alert(`Бот ${start ? 'включен' : 'выключен'}`);
  showBotInfo(account); // Обновить информацию
}

// Функция для изменения статуса
async function changeStatus(account) {
  const newStatus = prompt("Введите новый пользовательский статус:");
  if (newStatus) {
    const botData = await getBotData(account);
    botData.BotConfig.CustomGamePlayedWhileIdle = newStatus;
    await updateBotConfig(account, botData.BotConfig);
    showBotInfo(account);
  }
}

// Функция для обновления конфигурации бота
async function updateBotConfig(account, newConfig) {
  const response = await fetch(`http://46.8.21.39:1242/Api/Bot/${account}`, {
    method: 'POST',
    body: JSON.stringify({ BotConfig: newConfig }),
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json();
}

// Вернуться к списку аккаунтов
document.getElementById('backToAccountsButton').onclick = function () {
  document.getElementById('accounts').style.display = 'block';
  document.getElementById('bot-info').style.display = 'none';
};

// Переключение темы
document.getElementById('theme-toggle').onclick = function () {
  document.body.classList.toggle('dark-mode');
  document.getElementById('theme-toggle').innerHTML = document.body.classList.contains('dark-mode') ? '🌞' : '🌙';
  localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
};
