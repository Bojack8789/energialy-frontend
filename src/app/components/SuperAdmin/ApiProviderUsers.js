// ApiProviderUsers.js — CORREGIDO: suscripciones conectadas a la API real

const apiUrl = process.env.NEXT_PUBLIC_BASE_URL;

// Helper para obtener el token desde sessionStorage
const getAuthHeaders = () => {
  if (typeof window === "undefined") return {};
  const token = sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const dataProvider = {
  getList: (resource, params) => {
    // ✅ FIX: Ya no usa datos mock — llama a la API real para todos los recursos
    const url = `${apiUrl}/${resource}`;
    return fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((json) => ({
        data: Array.isArray(json) ? json : [json],
        total: Array.isArray(json) ? json.length : 1,
      }))
      .catch((error) => {
        console.error(`Error fetching ${resource}:`, error);
        return { data: [], total: 0 };
      });
  },

  getOne: (resource, params) => {
    const url = `${apiUrl}/${resource}/${params.id}`;
    return fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((json) => ({ data: json }))
      .catch((error) => {
        console.error(`Error fetching ${resource} ${params.id}:`, error);
        throw error;
      });
  },

  create: (resource, params) => {
    // ✅ FIX: Ya no usa mock para subscriptions ni companySubscriptions
    const url = `${apiUrl}/${resource}`;
    const options = {
      method: "POST",
      body: JSON.stringify(params.data),
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    };

    return fetch(url, options)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((json) => ({
        data: { ...params.data, id: json.id || Date.now() },
      }))
      .catch((error) => {
        console.error(`Error creating ${resource}:`, error);
        throw error;
      });
  },

  update: (resource, params) => {
    const url = `${apiUrl}/${resource}/${params.id}`;
    const options = {
      method: "PUT",
      body: JSON.stringify(params.data),
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    };

    return fetch(url, options)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((json) => ({ data: json }))
      .catch((error) => {
        console.error(`Error updating ${resource} ${params.id}:`, error);
        throw error;
      });
  },

  delete: (resource, params) => {
    const url = `${apiUrl}/${resource}/${params.id}`;
    return fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((json) => ({ data: json }))
      .catch((error) => {
        console.error(`Error deleting ${resource} ${params.id}:`, error);
        throw error;
      });
  },

  deleteMany: (resource, params) => {
    const url = `${apiUrl}/${resource}`;
    return fetch(url, {
      method: "DELETE",
      body: JSON.stringify(params.ids),
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((json) => ({ data: json }))
      .catch((error) => {
        console.error(`Error batch deleting ${resource}:`, error);
        throw error;
      });
  },
};

export default dataProvider;
