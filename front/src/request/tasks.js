import URL_ from "./url.js";

export async function getInPeriod(dateFrom, dateTo) {
    const url = new URL(`${URL_}/tasks`);

    // нужна только дата вида YYYY-MM-DD
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
    };

    url.searchParams.append('date_from', formatDate(dateFrom));
    url.searchParams.append('date_to', formatDate(dateTo))

    const response = await fetch(url.toString(), {
        method: 'GET',
        credentials: "include"
    });

    if (!response.ok) {
        throw new Error('Ошибка загрузки задач');
    }
    
    return await response.json();
}