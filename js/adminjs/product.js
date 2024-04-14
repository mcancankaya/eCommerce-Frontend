import {
  getAll,
  deleteById,
  getProductById,
  updateProductAPI,
  createProductAPI,
} from "../api.js";
import { checkUserIsAuthenticated, isAdmin, isLogin } from "../auth.js";

const addForm = document.querySelector("#addForm");
const updateForm = document.querySelector("#updateForm");

const tableBody = document.querySelector("#contentTable tbody");

const updateChangesBtn = document.querySelector("#update-changes");

const alertBox = document.querySelector("#alert-box");

/**
 * modal const
 */
const modal = document.querySelector("#updateModal");
const modalBrandList = modal.querySelector("#modalbrandList");
const modalModelList = modal.querySelector("#modalmodelList");
const modalcategoryList = modal.querySelector("#modalcategoryList");

const brandList = document.querySelector("#brandList");

function updateAndDeleteButtonsClickEvent() {
  tableBody.addEventListener("click", function (e) {
    e.preventDefault();
    if (e.target.name === "update-btn") updateProductEvent(e.target);
    if (e.target.name === "delete-btn") deleteProductEvent(e.target);
  });
}

function inModalSaveButtonClickEvent() {
  updateChangesBtn.addEventListener("click", function (event) {
    if (!updateForm.checkValidity()) {
      event.preventDefault(); // Eğer form doğrulanmıyorsa göndermeyi engeller
      event.stopPropagation();
    } else {
      updateProduct();
    }
    updateForm.classList.add("was-validated");
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  isLogin();
  isAdmin();

  productTableInit();
  fillSelectList("brand", "brandList");
  fillSelectList("model", "modelList");
  fillSelectList("category", "categoryList");
  updateAndDeleteButtonsClickEvent();
  inModalSaveButtonClickEvent();
  brandListChangeEvent();
  addFormValidEvent();
});

function addFormValidEvent() {
  addForm.addEventListener("submit", function (event) {
    if (!this.checkValidity()) {
      event.preventDefault(); // Eğer form doğrulanmıyorsa göndermeyi engeller
      event.stopPropagation();
      this.classList.add("was-validated");
    } else {
      createProduct(addForm, event);
      this.classList.remove("was-validated");
    }
  });
}

function brandListChangeEvent() {
  brandList.addEventListener("change", async function () {
    filterModelSelectByBrandId("brandList", "modelList");
  });
  modalBrandList.addEventListener("change", async function () {
    filterModelSelectByBrandId("modalbrandList", "modalmodelList");
  });
}
function updateProductEvent(btn) {
  fillModal(btn.value);
}

function deleteProductEvent(btn) {
  btn.disabled = true;
  deleteProductById(btn.value);
}

/**
 * Events end
 */
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

/**
 * Functions
 */
function createProduct(form, event) {
  event.preventDefault();
  const productName = form.querySelector("#productName").value;
  const description = form.querySelector("#description").value;
  const price = form.querySelector("#productPrice").value;
  const stockAmount = form.querySelector("#productStockAmount").value;
  const brandId = form.querySelector("#brandList").value;
  const modelId = form.querySelector("#modelList").value;
  const categoryId = form.querySelector("#categoryList").value;
  const fileImage = form.querySelector("#file").files[0];
  const addedForm = new FormData();

  addedForm.append("file", fileImage);

  const addedProduct = {
    name: productName,
    description: description,
    price: price,
    stockAmount: stockAmount,
    brandId: brandId,
    modelId: modelId,
    categoryId: categoryId,
    file: fileImage,
  };

  addedForm.append(
    "product",
    new Blob([JSON.stringify(addedProduct)], { type: "application/json" })
  );

  createProductAPI(addedForm).then((res) => {
    if (res.status) {
      showAlert("success", "Ürün Eklendi -> " + res.data.name);
      form.reset();
      productTableInit();
    }
  });
}

function updateProduct() {
  const modal = document.querySelector("#updateModal");
  const pId = modal.querySelector("#productId");
  const productName = modal.querySelector("#productName");
  const description = modal.querySelector("#description");
  const productPrice = modal.querySelector("#productPrice");
  const productStockAmount = modal.querySelector("#productStockAmount");
  const modelList = modal.querySelector("#modalmodelList");
  const categoryList = modal.querySelector("#modalcategoryList");
  const isActive = modal.querySelector("#modalisActive");

  const product = {
    id: pId.value,
    name: productName.value,
    description: description.value,
    stockAmount: productStockAmount.value,
    categoryId: categoryList.value,
    modelId: modelList.value,
    price: productPrice.value,
    isActive: isActive.checked ? true : false,
  };

  updateProductAPI(product).then((res) => {
    showAlert("success", res.message);
    $("#updateModal").modal("hide");
    updateForm.reset();
    updateChangesBtn.disabled = false;
    productTableInit();
  });
}

function fillModal(productId) {
  fillSelectList("brand", "modalbrandList");
  fillSelectList("model", "modalmodelList");
  fillSelectList("category", "modalcategoryList");
  const pId = modal.querySelector("#productId");
  const productName = modal.querySelector("#productName");
  const description = modal.querySelector("#description");
  const productPrice = modal.querySelector("#productPrice");
  const productStockAmount = modal.querySelector("#productStockAmount");
  const isActive = modal.querySelector("#modalisActive");

  getProductById(productId).then((res) => {
    pId.value = res.data.id;
    productName.value = res.data.name;
    description.value = res.data.description;
    productPrice.value = res.data.price;
    productStockAmount.value = res.data.stockAmount;
    modalBrandList.value = res.data.model.brand.id;
    modal.querySelector("#currentBrand").innerHTML =
      `Mevcut Marka : ` + res.data.model.brand.name;
    modalModelList.value = res.data.model.id;
    modal.querySelector("#currentModel").innerHTML =
      `Mevcut Model : ` + res.data.model.name;
    modalcategoryList.value = res.data.category.id;
    modal.querySelector("#currentCategory").innerHTML =
      `Mevcut Kategori : ` + res.data.category.name;
    res.data.isActive ? (isActive.checked = true) : (isActive.checked = false);
  });
}

async function deleteProductById(productId) {
  const res = await deleteById("product", productId);
  if (res.status) {
    showAlert("success", res.message);
  } else {
    showAlert("danger", res.message);
  }
  productTableInit();
}

// Model and Brand fetch
/**
 * Table init
 */

async function productTableInit() {
  const response = await getAll("product");
  if (response.status) {
    tableBody.innerHTML = "";
    response.data.forEach((item) => {
      const row = `
        <tr>
          <td>${item.id}</td>
          <td>${item.name}</td>
          <td>${item.description}</td>
          <td>${item.stockAmount}</td>
          <td>${item.price}</td>
          <td>${item.category.name}</td>
          <td>${item.model.name}</td>
          <td><input class="form-check-input" type="checkbox" value="" id="defaultCheck2" disabled ${
            item.isActive ? "checked" : ""
          }></td>
          <td>
              <div id="crud-buttons" role="group">
                <button name="update-btn" type="button" class="btn btn-warning" value="${
                  item.id
                }" data-bs-toggle="modal" data-bs-target="#updateModal">Güncelle</button>
                <button name="delete-btn"type="button" class="btn btn-danger" value="${
                  item.id
                }">Sil</button>
              </div>
          </td>
        </tr>`;
      tableBody.innerHTML += row;
    });
  }
}

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

/**
 *
 */

function filterModelSelectByBrandId(brandSelectId, modelSelectId) {
  const brandId = document.getElementById(brandSelectId).value;
  const url = brandId > 0 ? `model?brandId=${brandId}` : "model";
  fillSelectList(url, modelSelectId);
}
