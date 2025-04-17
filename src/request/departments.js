import URL from "./url.js";
const IS_TEST_MODE = true;


// Список тестовых отделений
const departments = {
  1: [
    { id: 1, name: "Отделение №1" },
    { id: 2, name: "Отделение №2" },
  ],
  2: [
    { id: 3, name: "Отделение №3" },
    { id: 4, name: "Отделение №4" },
  ],
  3: [
    { id: 5, name: "Отделение №5" },
    { id: 6, name: "Отделение №6" },
  ],
};


export async function fetchDepartments(token, organizationId) {
  if (IS_TEST_MODE) {
    return departments[organizationId] || [];
  }

  const response = await fetch(`${URL}/organizations/${organizationId}/departments`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Ошибка загрузки отделений");
  }
  
  return await response.json();
}