import {
  getAll,
  getById,
  updateModelAPI,
  createModelAPI,
  deleteById,
} from "../api.js";
import { checkUserIsAuthenticated, isAdmin, isLogin } from "../auth.js";

const addForm = document.querySelector("#addForm");

const updateForm = document.querySelector("#updateForm");
const updateChangesBtn = document.querySelector("#update-changes");

const tableBody = document.querySelector("#contentTable tbody");
const alertBox = document.querySelector("#alert-box");

const modal = document.querySelector("#updateModal");
const modalModelId = modal.querySelector("#modelId");
const modalModelName = modal.querySelector("#modelName");
const modalBrandList = modal.querySelector("#modalbrandList");

document.addEventListener("DOMContentLoaded", async function () {
  isLogin();
  isAdmin();
  fillSelectList("brand", "brandList");
  modalTableFill();
  updateAndDeleteButtonsClickEvent();
  addFormValidEvent();
  inModalSaveButtonClickEvent();
});
function updateAndDeleteButtonsClickEvent() {
  tableBody.addEventListener("click", function (e) {
    e.preventDefault();
    if (e.target.name === "update-btn") fillModal(e.target.value);
    if (e.target.name === "delete-btn") deleteModelById(e.target.value);
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
      createModel();
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
      updateModel();
      updateForm.classList.remove("was-validated");
    }
  });
}

/**
 * functions
 */
async function modalTableFill() {
  const response = await getAll("model");
  if (response.status) {
    tableBody.innerHTML = "";
    response.data.forEach((item) => {
      const row = `
        <tr>
          <td>${item.id}</td>
          <td>${item.name}</td>
          <td>${item.brand.name}</td>
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
async function fillModal(modelId) {
  await fillSelectList("brand", "modalbrandList");
  const response = await getById("model", modelId);

  if (response.status) {
    modalModelId.value = response.data.id;
    modalModelName.value = response.data.name;
    modalBrandList.value = response.data.brand.id;
    modal.querySelector(
      "#currentBrand"
    ).innerHTML = `Mevcut Marka : ${response.data.brand.name}`;
  }
}
async function deleteModelById(modelId) {
  const response = await deleteById("model", modelId);
  if (response.status) {
    showAlert("success", response.message);
  } else {
    showAlert("danger", response.message);
  }
  modalTableFill();
}

async function fillSelectList(url, selectId) {
  const selectElement = document.querySelector(`#${selectId}`);
  selectElement.innerHTML = "";
  const response = await getAll(url);
  if (response.status) {
    response.data.forEach((item) => {
      const option = `<option value="${item.id}">${item.name}</option>`;
      selectElement.innerHTML += option;
    });
  }
}
async function updateModel() {
  let updateModel = {
    id: modalModelId.value,
    name: modalModelName.value,
    brandId: modalBrandList.value,
  };
  const response = await updateModelAPI(updateModel);
  if (response.status) {
    showAlert("success", response.message, response.data.name);
    $("#updateModal").modal("hide");
    updateForm.reset();
  } else {
    showAlert("danger", response.message);
  }
  modalTableFill();
}

async function createModel() {
  let addedModel = {
    name: addForm.querySelector("#modelName").value,
    brandId: addForm.querySelector("#brandList").value,
  };
  const response = await createModelAPI(addedModel);
  if (response.status) {
    showAlert("success", response.message, response.data.name);
    addForm.reset();
  } else {
    showAlert("danger", response.message);
  }
  modalTableFill();
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
  addForm.scrollIntoView({ behavior: "smooth" });
  setTimeout(() => {
    alertBox.innerHTML = "";
  }, 5000);
}
