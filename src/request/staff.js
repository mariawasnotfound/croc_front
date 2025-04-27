import URL from "./url.js";

import { fetchOrganizations } from "../request/organizations.js";
import { fetchDepartments } from "../request/departments.js";

export async function fetchStaffInfo(organizationId, departmentId) {
    const response = await fetch(`${URL}/staff`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ organizationId, departmentId }),
        credentials: "include"
    });

    if (!response.ok) {
        throw new Error("Ошибка загрузки данных о сотруднике");
    }
    const staff = await response.json();

    const orgs = await fetchOrganizations();
    const organization = orgs.find(o => o.id === staff.organizationId);
    
    const deps = await fetchDepartments(staff.organizationId);
    const department = deps.find(i => i.id === staff.departmentId);
    
    return {
        ...staff,
        organizationName: organization.name,
        departmentName: department.name
    };
}