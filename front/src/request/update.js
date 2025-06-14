import URL from './url.js';

const updateQueue = [];
let isProcessing = false;

// Добавляет задачу в очередь на обновление
export function enqueueMeasureUpdate(taskId, data) {
  updateQueue.push({ taskId, data, type: 'measure' });
  processQueue();
}

// Добавляет задачу препарата в очередь на обновление
export function enqueuePreparationUpdate(taskId, data) {
  updateQueue.push({ taskId, data, type: 'preparation' });
  processQueue();
}

// Обрабатывает очередь обновлений
async function processQueue() {
  if (isProcessing || updateQueue.length === 0) return;
  isProcessing = true;

  const { taskId, data, type } = updateQueue.shift();

  try {
    if (type === 'preparation') {
      await sendPreparationUpdate(taskId, data);
    } else {
      await sendMeasureUpdate(taskId, data);
    }
    console.log(`Задача ${taskId} успешно обновлена`);
  } catch (error) {
    console.error(`Ошибка при обновлении задачи:`, error.message);
    setTimeout(() => {
      if (type === 'preparation') {
        enqueuePreparationUpdate(taskId, data);
      } else {
        enqueueMeasureUpdate(taskId, data);
      }
    }, 3000);
  }

  isProcessing = false;
  processQueue();
}

// Отправляет PATCH-запрос на сервер для измерений
async function sendMeasureUpdate(taskId, data) {
  let endpoint = `${URL}/measure-book/task/${taskId}`;
  let body = JSON.stringify(data);

  const response = await fetch(endpoint, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body,
    credentials: 'include'
  });

  let respData = null;
  try {
    const text = await response.text();
    if (text.trim()) respData = JSON.parse(text);
  } catch (e) {
    throw new Error('Не удалось разобрать ответ от сервера');
  }

  if (!response.ok) {
    throw new Error(respData?.message || respData?.error || 'Неизвестная ошибка');
  }

  return respData;
}

// Отправляет PATCH-запрос на сервер для препаратов
async function sendPreparationUpdate(taskId, data) {
  let endpoint = `${URL}/preparation-book/task/${taskId}`;
  let body = JSON.stringify(data);

  const response = await fetch(endpoint, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body,
    credentials: 'include'
  });

  let respData = null;
  try {
    const text = await response.text();
    if (text.trim()) respData = JSON.parse(text);
  } catch (e) {
    throw new Error('Не удалось разобрать ответ от сервера');
  }

  if (!response.ok) {
    throw new Error(respData?.message || respData?.error || 'Неизвестная ошибка');
  }

  return respData;
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