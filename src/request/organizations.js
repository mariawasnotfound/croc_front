import URL from "./url.js";

export async function getOrganizationsOfStaff() {
  const response = await fetch(`${URL}/organization/staff/`, {
    method: "GET",
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Ошибка загрузки медицинских организаций");
  }

  return await response.json();
}