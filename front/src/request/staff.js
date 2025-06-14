import URL from "./url.js";

export async function getHeader() {
  try {
    const response = await fetch(`${URL}/staff/header`, {
      method: 'GET',
      credentials: "include"
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 401) {
        window.location.href = '/login';
        return;
      }
      throw new Error(errorText || "Ошибка загрузки данных о сотруднике");
    }

    const data = await response.json();
    const staffData = data.header[0];
    
    const [surname, name, lastname] = staffData.staffFullName.split(' ');
    
    return {
      name: `${surname || ''} ${name || ''} ${lastname || ''}`.trim(),
      position: staffData.position || 'Должность не указана',
      organizationName: staffData.organization || 'Организация не указана',
      departmentName: staffData.department || 'Отделение не указано'
    };
    
  } catch (error) {
    console.error('Ошибка в getStaffInfo:', error);
    throw error;
  }
}