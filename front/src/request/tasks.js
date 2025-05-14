import URL from "./url.js";

export async function getInPeriod(date_from, date_to) {
    const url = new URL(`${URL}/tasks`);
    url.searchParams.append('dateFrom', date_from);
    url.searchParams.append('dateTo', date_to);

    const response = await fetch(url.toString(), {
        method: 'GET',
        credentials: "include"
    });

    if (!response.ok) {
        throw new Error('Ошибка загрузки задач');
    }
    
    return await response.json();
}