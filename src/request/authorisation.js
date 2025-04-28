import URL from "./url.js";
const IS_TEST_MODE = true;

const users = [
  { login: "user1", password: "123" },
  { login: "user2", password: "123" },
  { login: "admin", password: "admin" },
];

export async function login(username, password) {
  if (IS_TEST_MODE) {
    const user = users.find((u) => u.login === username && u.password === password);
    if (!user) {
      throw new Error("Ошибка авторизации: неверный логин или пароль");
    }
    return;
  }

  const response = await fetch(`${URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ login: username, password }),
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Ошибка авторизации");
  }
}