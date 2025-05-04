import URL from "./url.js";

export async function getDepartmentsOfStaff() {

  const response = await fetch(`${URL}/department/staff`, {
    method: "GET",
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Ошибка загрузки отделений");
  }
  
  return await response.json();
}