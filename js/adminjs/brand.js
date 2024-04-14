import {
  getAll,
  getById,
  deleteById,
  createBrandAPI,
  updateBrandAPI,
} from "../api.js";
import { checkUserIsAuthenticated, isAdmin, isLogin } from "../auth.js";

const addForm = document.querySelector("#addForm");

const updateForm = document.querySelector("#updateForm");
const updateChangesBtn = document.querySelector("#update-changes");

const tableBody = document.querySelector("#contentTable tbody");
const alertBox = document.querySelector("#alert-box");

const modal = document.querySelector("#updateModal");
const modalBrandId = modal.querySelector("#brandId");
const modalBrandName = modal.querySelector("#brandName");

document.addEventListener("DOMContentLoaded", async function () {
  isLogin();
  isAdmin();
  brandTableFill();
  updateAndDeleteButtonsClickEvent();
  addFormValidEvent();
  inModalSaveButtonClickEvent();
});

function updateAndDeleteButtonsClickEvent() {
  tableBody.addEventListener("click", function (e) {
    e.preventDefault();
    if (e.target.name === "update-btn") fillModal(e.target.value);
    if (e.target.name === "delete-btn") deleteBrandById(e.target.value);
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
      createBrand();
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
      updateBrand();
      updateForm.classList.remove("was-validated");
    }
  });
}

async function brandTableFill() {
  const response = await getAll("brand");
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

async function fillModal(brandId) {
  const response = await getById("brand", brandId);
  if (response.status) {
    modalBrandId.value = response.data.id;
    modalBrandName.value = response.data.name;
  }
}

async function deleteBrandById(brandId) {
  const response = await deleteById("brand", brandId);
  if (response.status) {
    showAlert("success", response.message);
  } else {
    showAlert("danger", response.message);
  }
  brandTableFill();
}

async function createBrand() {
  const nameBrand = addForm.querySelector("#brandName").value;
  let addedBrand = { name: nameBrand };
  const response = await createBrandAPI(addedBrand);
  if (response.status) {
    showAlert("success", response.message);
    addForm.reset();
  } else {
    showAlert("danger", response.message);
  }
  brandTableFill();
}

async function updateBrand() {
  let updatedBrand = {
    id: updateForm.querySelector("#brandId").value,
    name: updateForm.querySelector("#brandName").value,
  };
  const response = await updateBrandAPI(updatedBrand);
  if (response.status) {
    showAlert("success", response.message);
    $("#updateModal").modal("hide");
    updateForm.reset();
  } else {
    showAlert("danger", response.message);
  }
  brandTableFill();
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
