import {
  getAll,
  deleteById,
  getById,
  createCategoryAPI,
  updateCategoryAPI,
} from "../api.js";
import { checkUserIsAuthenticated, isAdmin, isLogin } from "../auth.js";

const addForm = document.querySelector("#addForm");

const updateForm = document.querySelector("#updateForm");
const updateChangesBtn = document.querySelector("#update-changes");

const tableBody = document.querySelector("#contentTable tbody");
const alertBox = document.querySelector("#alert-box");

const modal = document.querySelector("#updateModal");
const modalCategoryId = modal.querySelector("#categoryId");
const modalCategoryName = modal.querySelector("#categoryName");
/**
 * EVENTS
 */
document.addEventListener("DOMContentLoaded", async function () {
  isLogin();
  isAdmin();
  categoryTableFill();
  updateAndDeleteButtonsClickEvent();
  addFormValidEvent();
  inModalSaveButtonClickEvent();
});

function updateAndDeleteButtonsClickEvent() {
  tableBody.addEventListener("click", function (e) {
    e.preventDefault();
    if (e.target.name === "update-btn") fillModal(e.target.value);
    if (e.target.name === "delete-btn") deleteCategoryById(e.target.value);
  });
}

function addFormValidEvent() {
  addForm.addEventListener("submit", function (event) {
    if (!this.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
      this.classList.add("was-validated");
    } else {
      event.preventDefault();
      createCategory();
      this.classList.remove("was-validated");
    }
  });
}

function inModalSaveButtonClickEvent() {
  updateChangesBtn.addEventListener("click", function (event) {
    if (!updateForm.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
      updateForm.classList.add("was-validated");
    } else {
      updateCategory();
      updateForm.classList.remove("was-validated");
    }
  });
}
/**
 * functions
 */
async function categoryTableFill() {
  const response = await getAll("category");
  if (response.status) {
    tableBody.innerHTML = "";
    response.data.forEach((item) => {
      const row = `
        <tr>
          <td>${item.id}</td>
          <td>${item.name}</td>
          <td>
              <div id="crud-buttons" role="group">
                <button name="update-btn" type="button" class="btn btn-warning" value="${item.id}" data-bs-toggle="modal" data-bs-target="#updateModal">Güncelle</button>
                <button name="delete-btn"type="button" class="btn btn-danger" value="${item.id}">Sil</button>
              </div>
          </td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });
  }
}

async function fillModal(categoryId) {
  const response = await getById("category", categoryId);
  console.log(response);
  if (response.status) {
    modalCategoryId.value = response.data.id;
    modalCategoryName.value = response.data.name;
  }
}

async function deleteCategoryById(categoryId) {
  const response = await deleteById("category", categoryId);
  if (response.status) {
    showAlert("success", response.message);
  } else {
    showAlert("danger", response.message);
  }
  categoryTableFill();
}
async function createCategory() {
  const nameCategory = addForm.querySelector("#categoryName").value;
  let addedCategory = { name: nameCategory };
  const response = await createCategoryAPI(addedCategory);
  if (response.status) {
    showAlert("success", response.message);
    addForm.reset();
  } else {
    showAlert("danger", response.message);
  }
  categoryTableFill();
}
async function updateCategory() {
  let updateCategory = {
    id: updateForm.querySelector("#categoryId").value,
    name: updateForm.querySelector("#categoryName").value,
  };
  const response = await updateCategoryAPI(updateCategory);
  if (response.status) {
    showAlert("success", response.message);
    $("#updateModal").modal("hide");
    updateForm.reset();
  } else {
    showAlert("danger", response.message);
  }
  categoryTableFill();
}
/**
 * alert
 */

function showAlert(type, message) {
  const alert = `
  <div class="alert alert-${type} alert-dismissible" role="alert">
     <div>${message}</div>
     <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>
  `;
  alertBox.innerHTML = alert;
  setTimeout(() => {
    alertBox.innerHTML = "";
  }, 3000);
}
