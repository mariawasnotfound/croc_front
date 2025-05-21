import URL from "./url.js";

export async function updatePreparationTask(taskId, data) {
  try {
    const response = await fetch(`${URL}/preparation-book/task/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        completedAt: data.completedAt
      }),
      credentials: "include"
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Ошибка при обновлении задачи введения препарата');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка в updatePreparationTask:', error);
    throw error;
  }
}

export async function updateMeasureTask(taskId, data) {
  try {
    const requestData = {
      completedAt: data.completedAt,
      bloodPressure: data.result.bloodPressure === 'Не измерялось' ? null : parseInt(data.result.bloodPressure),
      respiratoryRate: data.result.respiratoryRate === 'Не измерялось' ? null : parseInt(data.result.respiratoryRate),
      heartRate: data.result.heartRate === 'Не измерялось' ? null : parseInt(data.result.heartRate)
    };

    Object.keys(requestData).forEach(key => {
      if (requestData[key] === null) {
        delete requestData[key];
      }
    });

    const response = await fetch(`${URL}/measure-book/task/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(requestData),
      credentials: "include"
    });

    if (!response.ok) {
      let errorMessage = 'Ошибка при обновлении задачи измерения';
      
      try {
        const errorText = await response.text();
        if (errorText) {
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorData.message || errorText;
          } catch {
            errorMessage = errorText;
          }
        }
      } catch (e) {
        console.error('Ошибка при чтении тела ошибки:', e);
      }
      
      throw new Error(errorMessage);
    }
    
    try {
      const responseText = await response.text();
      return responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      console.warn('Ответ не содержит JSON, возвращаем пустой объект');
      return {};
    }
  } catch (error) {
    console.error('Ошибка в updateMeasureTask:', error);
    throw error;
  }
}