import URL from "./url.js";

export async function getInPeriod(date_from, date_to) {
    const response = await fetch(`${URL}/tasks`, {
        method: 'POST',
        headers: {
            "Content-type": 'application/json'
        },
        body: JSON.stringify({ date_from, date_to }),
        credentials: "include"
    });

    if (!response.ok) {
        throw new Error('Ошибка загрузки задач')
    }
    
    return await response.json();
}