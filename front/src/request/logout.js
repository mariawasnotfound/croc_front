import URL from "./url.js";

export async function logout() {
  const response = await fetch(`${URL}/user/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Ошибка выхода из системы");
  }
}