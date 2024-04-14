import { getAll } from "./api.js";
import { checkUserIsAuthenticated, isAdmin, isLogin } from "./auth.js";

/**
 * EVENTS
 */

/**
 * EVENTS END
 */
document.addEventListener("DOMContentLoaded", function () {
  isLogin();
  isAdmin();
});

export function fillSelectOption(url, selectId) {
  const selectElement = document.querySelector(`#${selectId}`);
  selectElement.innerHTML = "";
  const response = getAll(url);
  response.then((data) => {
    if (data.status) {
      data.data.forEach((item) => {
        const option = `<option value="${item.id}">${item.name}</option>`;
        selectElement.innerHTML += option;
      });
    }
  });
}

export function filterModelSelectList() {
  const brandId = document.getElementById("brandList").value;
  const url = brandId > 0 ? `model?brandId=${brandId}` : "model";
  fillSelectOption(url, "modelList");
}

/**
 * Functions
 */
