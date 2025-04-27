import URL from "./url.js";
const IS_TEST_MODE = true;

const users = [
  { username: "user1", password: "123" },
  { username: "user2", password: "123" },
  { username: "admin", password: "admin" },
];

export async function login(username, password) {
  if (IS_TEST_MODE) {
    const user = users.find((u) => u.username === username && u.password === password);
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
    body: JSON.stringify({ username, password }),
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Ошибка авторизации");
  }
}