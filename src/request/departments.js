import URL from "./url.js";

export async function fetchDepartments(token, organizationId) {
    const response = await fetch(`${URL}/organizations/${organizationId}/departments`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!response.ok) {
      throw new Error("Ошибка загрузки отделений");
    }
  
    return await response.json(); // Ожидаем массив [{ id: 1, name: "Отделение №1" }, ...]
  }  