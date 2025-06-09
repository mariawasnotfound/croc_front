import URL from './url.js';

// Очередь обновлений
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
    console.log(`Показатель ${field} успешно обновлён`);
  } catch (error) {
    console.error(`Ошибка при обновлении ${field}:`, error.message);
    setTimeout(() => {
      enqueueMeasureUpdate(taskId, field, value); // повтор попытки через 3 секунды
    }, 3000);
  }

  isProcessing = false;
  processQueue();
}

// Отправляет PATCH-запрос на сервер для одного поля
async function sendMeasureUpdate(taskId, field, value) {
  const response = await fetch(`${URL}/measure-book/task/${taskId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      result: value
    }),
    credentials: 'include'
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ошибка ответа: ${text}`);
  }

  return await response.json();
}

// Старые функции (для совместимости)
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