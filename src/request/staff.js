import URL from "./url.js";
const IS_TEST_MODE = true;

import { fetchOrganizations } from "../request/organizations.js";
import { fetchDepartments } from "../request/departments.js";

// по токену юзера находим информацию о нем
const test_staff = { 
    token1: {
      surname: "Лебедева",
      name: "Варвара",
      lastname: "Матвеевна",
      position: "Медицинская сестра",
      organizationId: 1,
      departmentId: 2,
      ward: 12
    },
    token2: {
        surname: "Куликова",
        name: "Алиса",
        lastname: "Юрьевна",
        position: "Медицинская сестра",
        organizationId: 2,
        departmentId: 3,
        ward: 12
    },
    adminToken: {
      surname: "Гусев",
      name: "Виктор",
      lastname: "Андреевич",
      position: "Медицинский брат",
      organizationId: 3,
      departmentId: 5,
      ward: 5
    }
  };

export async function fetchStaffInfo(token, organizationId, departmentId) {
    if (IS_TEST_MODE) {
        const staff = test_staff[token];
        if (staff) {
        const med_orgs = await fetchOrganizations(token);
        const organization = med_orgs.find(i => i.id === staff.organizationId);

        const deps = await fetchDepartments(token, organizationId);
        const department = deps.find(i => i.id === staff.departmentId);
        return {
            ...staff,
            organizationName: organization.name,
            departmentName: department.name
      };
    }
    return [];
    }
    const response = await fetch(`${URL}/staff`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ organizationId, departmentId })
    });

    if (!response.ok) {
        throw new Error("Ошибка загрузки данных о сотруднике");
    }
    const staff = await response.json();

    const orgs = await fetchOrganizations(token);
    const organization = orgs.find(o => o.id === staff.organizationId);
    
    const deps = await fetchDepartments(token, organizationId);
    const department = deps.find(i => i.id === staff.departmentId);
    
    return {
        ...staff,
        organizationName: organization.name,
        departmentName: department.name
    };
}