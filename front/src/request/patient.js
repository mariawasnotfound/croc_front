import URL from './url.js';

export async function getPreparationData(taskId) {
  const response = await fetch(`${URL}/preparation-book/task/${taskId}`, {
    method: 'GET',
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Ошибка загрузки данных о препарате');
  }
  
  const data = await response.json();
  return data.task[0];
}

export async function getMeasureData(taskId) {
  const response = await fetch(`${URL}/measure-book/task/${taskId}`, {
    method: 'GET',
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Ошибка загрузки данных об измерении');
  }
  
  const data = await response.json();
  return data.task[0];
}