import URL from "./url.js";
// Тестовый режим
const IS_TEST_MODE = true;

// Тестовые пользователи
const users = [
  { username: "user1", password: "123", token: "token1" },
  { username: "user2", password: "123", token: "token2" },
  { username: "admin", password: "admin", token: "adminToken" },
];

export async function login(username, password) {
  if (IS_TEST_MODE) {
    const user = users.find((u) => u.username === username && u.password === password);
    if (!user) {
      throw new Error("Ошибка авторизации: неверный логин или пароль");
    }
    return user.token;
  }

  // Запрос к серверу
  const response = await fetch(`${URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Ошибка авторизации");
  }

  const data = await response.json();
  return data.token;
}