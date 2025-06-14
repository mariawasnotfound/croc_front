import URL from "./url.js";

export async function getDepartmentsOfStaff(organizationId) {
    const response = await fetch(`${URL}/department/staff/${organizationId}`, {
        method: "GET",
        credentials: "include"
    });

    if (!response.ok) {
        throw new Error("Ошибка загрузки отделений");
    }
    
    return await response.json();
}