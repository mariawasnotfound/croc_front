import URL from "./url.js";

export async function saveUserInfo({ organizationId, departmentId }) {
  const response = await fetch(`${URL}/user/save-info`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ organizationId, departmentId }),
    credentials: "include"
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Ошибка сохранения информации о сотруднике");
  }

  try {
    return await response.json();
  } catch (error) {
    return { success: true };
  }
}