import URL from "./url.js";
const IS_TEST_MODE = true;

// в каждом отделении свои задачи, ключ - departmentId, значение - массив задач
const test_tasks = {
    1: [
        {
            dateTime: "2025-04-16T13:15:00",
            patient: "Петров Василий Андреевич",
            birthDate: "1983-01-20",
            room: "203",
            measurements: "Температура, ЧСС",
            medications: "Антибиотик",
            diet: "Общая"
        }, 
        {
            dateTime: "2025-04-15T13:30:00",
            patient: "Иванова Елена Владимировна",
            birthDate: "1995-07-12",
            room: "201",
            measurements: "",
            medications: "Укол",
            diet: "Щадящая"
        }
    ],
    5: [
        {
            dateTime: "2025-04-15T12:00:00",
            patient: "Васильев Владимир Иванович",
            birthDate: "1990-03-21",
            room: "204",
            measurements: "",
            medications: "Антибиотик",
            diet: "Диабетическая"
        },
        {
            dateTime: "2025-04-10T12:00:00",
            patient: "Еремина Мария Александровна",
            birthDate: "1975-08-24",
            room: "205",
            measurements: "Давление, ЧДД",
            medications: "",
            diet: "Общая"
        }
    ]
};

export async function fetchTasks(organizationId, departmentId) {
    if (IS_TEST_MODE) {
        return test_tasks[departmentId] || [];
    }
    const response = await fetch(`${URL}/tasks`, {
        method: 'POST',
        headers: {
            "Content-type": 'application/json'
        },
        body: JSON.stringify({ organizationId, departmentId }),
        credentials: "include"
    });

    if (!response.ok) {
        throw new Error('Ошибка загрузки задач')
    }

    return await response.json();
}