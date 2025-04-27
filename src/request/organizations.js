import URL from "./url.js";
const IS_TEST_MODE = true;

const organizations = [
  { id: 1, name: "MO №1" },
  { id: 2, name: "MO №2" },
  { id: 3, name: "MO №3" },
];

export async function fetchOrganizations() {
  if (IS_TEST_MODE) {
    return organizations;
  }

  const response = await fetch(`${URL}/organizations`, {
    method: "POST",
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Ошибка загрузки медицинских организаций");
  }

  return await response.json();
}