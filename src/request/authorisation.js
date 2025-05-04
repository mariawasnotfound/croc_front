import URL from "./url.js";

export async function login(username, password) {
  const response = await fetch(`${URL}/user/login`, {
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