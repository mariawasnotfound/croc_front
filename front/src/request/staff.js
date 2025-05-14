import URL from "./url.js";

export async function getHeader() {
  try {
    const response = await fetch(`${URL}/staff/header`, {
      method: 'GET',
      credentials: "include"
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Ошибка загрузки данных о сотруднике");
    }

    const staffData = await response.json();
    
    return {
      name: `${staffData.surname || ''} ${staffData.name || ''} ${staffData.patronymic || ''}`.trim(),
      position: staffData.position || 'Должность не указана',
      organizationName: staffData.organizationName || 'Организация не указана',
      departmentName: staffData.departmentName || 'Отделение не указано'
    };
    
  } catch (error) {
    console.error('Ошибка в getStaffInfo:', error);
    throw error;
  }
}