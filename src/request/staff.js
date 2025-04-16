import URL from "./url.js";
const IS_TEST_MODE = true;

// по токену юзера находим информацию о нем
const test_staff = { 
    token1: {
      surname: "Лебедева",
      firstname: "Варвара",
      lastname: "Матвеевна",
      position: "Медицинская сестра",
      organizationId: 1,
      departmentId: 2,
      ward: 12
    },
    token2: {
        surname: "Куликова",
        firstname: "Алиса",
        lastname: "Юрьевна",
        position: "Медицинская сестра",
        organizationId: 2,
        departmentId: 3,
        ward: 12
    },
    adminToken: {
      surname: "Гусев",
      firstname: "Виктор",
      lastname: "Андреевич",
      position: "Медицинский брат",
      organizationId: 3,
      departmentId: 5,
      ward: 5
    }
  };

export async function fetchStaffInfo(token, organizationId, departmentId) {
    if (IS_TEST_MODE) {
        return test_staff[token] || [];
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

    return await response.json();
}
  