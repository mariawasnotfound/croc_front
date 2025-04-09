import URL from "./url.js";

export async function fetchOrganizations(token) {
    const response = await fetch(`${URL}/organizations`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!response.ok) {
      throw new Error("Ошибка загрузки Медицинских организаций");
    }
  
    return await response.json(); // Ожидаем массив объектов [{ id: 1, name: "МО №1" }, ...]
  }  