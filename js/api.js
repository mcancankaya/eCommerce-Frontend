import { checkUserIsAuthenticated, getDefaultHeaders } from "./auth.js";
export const BASE_URL = "http://localhost:8080/api/v1/";

export async function getById(path, id) {
  const response = await fetch(BASE_URL.concat(path).concat(`/${id}`), {
    method: "GET",
    headers: getDefaultHeaders(),
  })
    .then((res) => {
      if (!res.ok) throw new Error(res.status);
      else {
        return res.json();
      }
    })
    .catch((err) => {
      if (err.message === "403") {
        checkUserIsAuthenticated();
      }
    });
  return response;
}

export async function getAll(url) {
  const response = await fetch(BASE_URL.concat(url)).then((res) => res.json());
  return response;
}

export function getProductById(url) {
  const response = fetch(BASE_URL.concat("product/").concat(url)).then((res) =>
    res.json()
  );
  return response;
}

export function getProductByModelId(url) {
  const response = fetch(url).then((res) => res.json());
  return response;
}

export function createOrderPost(orderRequest) {
  const response = fetch(BASE_URL.concat("order"), {
    method: "POST",
    headers: getDefaultHeaders(),
    body: JSON.stringify({
      userId: orderRequest.userId,
      orderItems: orderRequest.orderItems,
    }),
  })
    .then((res) => {
      if (!res.ok) throw new Error(res.status);
      else {
        return res.json();
      }
    })
    .catch((err) => {
      if (err.message === "403") {
        checkUserIsAuthenticated();
      }
    });
  return response;
}

/**
 * Delete
 */
export function deleteById(path, deleteId) {
  const response = fetch(BASE_URL.concat(path).concat(`/${deleteId}`), {
    method: "DELETE",
    headers: getDefaultHeaders(),
  })
    .then((res) => {
      if (!res.ok) throw new Error(res.status);
      else {
        return res.json();
      }
    })
    .catch((err) => {
      if (err.message === "403") {
        checkUserIsAuthenticated();
      }
    });
  return response;
}
/**
 * Product
 */
export function updateProductAPI(product) {
  const response = fetch(BASE_URL.concat("product"), {
    method: "PUT",
    headers: getDefaultHeaders(),
    body: JSON.stringify(product),
  })
    .then((res) => {
      if (!res.ok) throw new Error(res.status);
      else {
        return res.json();
      }
    })
    .catch((err) => {
      if (err.message === "403") {
        checkUserIsAuthenticated();
      }
    });
  return response;
}

export function createProductAPI(product) {
  let token = JSON.parse(localStorage.getItem("authInfo")).jwtToken;

  const response = fetch(BASE_URL.concat("product"), {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
    },
    body: product,
  })
    .then((res) => {
      if (!res.ok) throw new Error(res.message);
      else {
        return res.json();
      }
    })
    .catch((err) => {
      if (err.message === "403") {
        checkUserIsAuthenticated();
      }
    });
  return response;
}

/**
 * Category
 */
export function createCategoryAPI(category) {
  const response = fetch(BASE_URL.concat("category"), {
    method: "POST",
    headers: getDefaultHeaders(),
    body: JSON.stringify(category),
  })
    .then((res) => {
      if (!res.ok) throw new Error(res.status);
      else {
        return res.json();
      }
    })
    .catch((err) => {
      if (err.message === "403") {
        checkUserIsAuthenticated();
      }
    });
  return response;
}

export function updateCategoryAPI(updateCategory) {
  const response = fetch(BASE_URL.concat("category"), {
    method: "PUT",
    headers: getDefaultHeaders(),
    body: JSON.stringify(updateCategory),
  })
    .then((res) => {
      if (!res.ok) throw new Error(res.status);
      else {
        return res.json();
      }
    })
    .catch((err) => {
      if (err.message === "403") {
        checkUserIsAuthenticated();
      }
    });
  return response;
}

/**
 * Brand
 */
export function createBrandAPI(brand) {
  const response = fetch(BASE_URL.concat("brand"), {
    method: "POST",
    headers: getDefaultHeaders(),
    body: JSON.stringify(brand),
  })
    .then((res) => {
      if (!res.ok) throw new Error(res.status);
      else {
        return res.json();
      }
    })
    .catch((err) => {
      if (err.message === "403") {
        checkUserIsAuthenticated();
      }
    });
  return response;
}
export function updateBrandAPI(updateBrand) {
  const response = fetch(BASE_URL.concat("brand"), {
    method: "PUT",
    headers: getDefaultHeaders(),
    body: JSON.stringify(updateBrand),
  })
    .then((res) => {
      if (!res.ok) throw new Error(res.status);
      else {
        return res.json();
      }
    })
    .catch((err) => {
      if (err.message === "403") {
        checkUserIsAuthenticated();
      }
    });
  return response;
}

/**
 * Model
 */
export function createModelAPI(model) {
  const response = fetch(BASE_URL.concat("model"), {
    method: "POST",
    headers: getDefaultHeaders(),
    body: JSON.stringify(model),
  })
    .then((res) => {
      if (!res.ok) throw new Error(res.status);
      else {
        return res.json();
      }
    })
    .catch((err) => {
      if (err.message === "403") {
        checkUserIsAuthenticated();
      }
    });
  return response;
}
export function updateModelAPI(model) {
  const response = fetch(BASE_URL.concat("model"), {
    method: "PUT",
    headers: getDefaultHeaders(),
    body: JSON.stringify(model),
  })
    .then((res) => {
      if (!res.ok) throw new Error(res.status);
      else {
        return res.json();
      }
    })
    .catch((err) => {
      if (err.message === "403") {
        checkUserIsAuthenticated();
      }
    });
  return response;
}
