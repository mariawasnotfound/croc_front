import URL from './url.js';

const updateQueue = [];
let isProcessing = false;

// Добавляет задачу в очередь на обновление
export function enqueueMeasureUpdate(taskId, field, value) {
  updateQueue.push({ taskId, field, value });
  processQueue();
}

// Обрабатывает очередь обновлений
async function processQueue() {
  if (isProcessing || updateQueue.length === 0) return;
  isProcessing = true;

  const { taskId, field, value } = updateQueue.shift();

  try {
    await sendMeasureUpdate(taskId, field, value);
    console.log(`Поле ${field} успешно обновлено`);
  } catch (error) {
    console.error(`Ошибка при обновлении ${field}:`, error.message);
    setTimeout(() => {
      enqueueMeasureUpdate(taskId, field, value);
    }, 3000);
  }

  isProcessing = false;
  processQueue();
}

// Отправляет PATCH-запрос на сервер
async function sendMeasureUpdate(taskId, field, value) {
  let endpoint = `${URL}/measure-book/task/${taskId}`;
  let body;

  if (field === 'completedAt') {
    body = JSON.stringify({
      completedAt: value
    });
  } else {
    const numericValue = parseFloat(value.replace(',', '.'));

    body = JSON.stringify({
      result: isNaN(numericValue) ? value : numericValue
    });
  }

  const response = await fetch(endpoint, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body,
    credentials: 'include'
  });

  let data = null;
  try {
    const text = await response.text();
    if (text.trim()) data = JSON.parse(text);
  } catch (e) {
    throw new Error('Не удалось разобрать ответ от сервера');
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Неизвестная ошибка');
  }

  return data;
}

export async function resetTask(taskId) {
  const endpoint = `${URL}/measure-book/task/${taskId}`;

  const response = await fetch(endpoint, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      completedAt: null,
      result: null
    }),
    credentials: 'include'
  });

  let data = null;
  try {
    const text = await response.text();
    if (text.trim()) data = JSON.parse(text);
  } catch (e) {
    throw new Error('Не удалось разобрать ответ от сервера');
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Не удалось сбросить задачу');
  }

  return data;
}

export async function updatePreparationTask(taskId, data) {
  const response = await fetch(`${URL}/preparation-book/task/${taskId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data),
    credentials: 'include'
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Ошибка при обновлении задачи введения препарата');
  }

  return await response.json();
}

export async function updateMeasureTask(taskId, data) {
  const response = await fetch(`${URL}/measure-book/task/${taskId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data),
    credentials: 'include'
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Ошибка при обновлении задачи измерения');
  }

  return await response.json();
}