import {
  BASE_URL,
  getAll,
  getProductByModelId,
  getProductById,
} from "./api.js";
import { isLogin } from "./auth.js";

const alertBox = document.querySelector("#alert-box");
const orderModal = document.querySelector("#cart-modal");
let cart = [];

function fillSelectOption(url, selectId) {
  const selectElement = document.querySelector(`#${selectId}`);
  const response = getAll(url);
  response.then((data) => {
    if (data.status) {
      selectElement.innerHTML = `<option value="0">-- Tümü --</option>`;
      data.data.forEach((item) => {
        const option = `<option value="${item.id}">${item.name}</option>`;
        selectElement.innerHTML += option;
      });
    }
  });
}

function createProductCard(byCategoryId) {
  const url =
    byCategoryId == 0 || byCategoryId === undefined
      ? `product`
      : `product/byCategory/${byCategoryId}`;
  const section = document.querySelector("#product-list");
  section.innerHTML = "";
  console.log(url);
  const response = getAll(url);
  response.then((data) => {
    data.data.forEach((item) => {
      if (item.isActive) {
        createProductCartHTML(item, section);
      }
    });
  });
}

function getProductByCategoryAndModelId(modelId, categoryId) {
  let url = new URL(BASE_URL + "product/filter");
  url.searchParams.append("model", modelId);
  url.searchParams.append("category", categoryId);
  const section = document.querySelector("#product-list");
  section.innerHTML = "";
  const response = getProductByModelId(url);
  response.then((data) => {
    console.log(data);
    if (data.data != null && data.data.length != 0)
      data.data.forEach((item) => {
        if (item.isActive) {
          createProductCartHTML(item, section);
        }
      });
    else {
      showAlert("warning", data.message);
    }
  });
}

function createProductCartHTML(item, section) {
  const productCard = `<div class="product-card col mb-5">
                             <div class="card h-100">
                            <!-- Product image-->
                            <img
                              class="card-img-top"
                              src="${
                                item.imageUrl != null
                                  ? item.imageUrl
                                  : "imgs/default.png"
                              }"
                              alt="..."
                              width = "250px"
                              height = "300px"
                            />
                            <!-- Product details-->
                            <div class="card-body p-4">
                              <div class="text-center">
                                <!-- Product name-->
                                <h5 id="name" class="fw-bolder">${
                                  item.name
                                }</h5>
                                <!-- Product price-->
                                <label id="price">${item.price.toFixed(
                                  2
                                )} &#8378;</label>
                              </div>
                            </div>
                            <!-- Product actions-->
                            <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
                              <div class="text-center">
                                <a type= "button" id="goDetailButton" class="btn btn-outline-info mt-auto" data-value = ${
                                  item.id
                                } >Ürünü Gör</a>
                                <a type="button" id="addToCartButton" class="btn btn-outline-success mt-auto" data-value=${
                                  item.id
                                }>Add Cart</a>
                              </div>
                            </div>
                            </div>
                            </div>`;
  section.innerHTML += productCard;
}

function fillCategoryList() {
  const categoryList = document.querySelector("#categoryList");
  const response = getAll("category");
  response.then((res) => {
    if (res.status)
      res.data.forEach((item) => {
        const button = `
    <button
    value="${item.id}"
    type="button"
    class="list-group-item list-group-item-action"
  >
    ${item.name}
  </button>`;
        categoryList.innerHTML += button;
      });
  });
}
// fill option
fillSelectOption("brand", "brandSelect");
fillSelectOption("model", "modelSelect");
fillCategoryList();
/**
 * Events
 */
document.addEventListener("DOMContentLoaded", (e) => {
  isLogin();
  createProductCard();
  productButtonEvent();
  checkCartLocalStorage();
  modalQuantityButtonsEvent();
});

document
  .getElementById("brandSelect")
  .addEventListener("change", getSelectOption);

document
  .getElementById("categoryList")
  .addEventListener("click", function (event) {
    Array.from(event.target.parentElement.children).forEach((child) =>
      child.classList.remove("active")
    );

    if (event.target && event.target.nodeName == "BUTTON") {
      event.target.classList.add("active");
      createProductCard(event.target.value);
    }
  });

document.getElementById("filterButton").addEventListener("click", function () {
  const categoryList = document.getElementById("categoryList").children;
  const activeCategory = Array.from(categoryList).filter((child) =>
    child.classList.contains("active")
  );
  const activeCategoryId = activeCategory[0].value;
  const selectedModel = document.getElementById("modelSelect").value;
  if (activeCategory != 0) {
    getProductByCategoryAndModelId(selectedModel, activeCategoryId);
  }
});

document
  .querySelector("#cart-modal-button")
  .addEventListener("click", function () {
    fillModal();
  });

document.querySelector("#saveOrder").addEventListener("click", function (e) {
  e.target.disabled = true;
  createOrder();
});

function productButtonEvent() {
  const productContainer = document.querySelector("#product-list");
  productContainer.addEventListener("click", (e) => {
    if (e.target.id === "goDetailButton") goProductDetailPage(e);
    if (e.target.id === "addToCartButton") addToCart(e.target);
  });
}

function modalQuantityButtonsEvent() {
  const buttonGroup = document.querySelector("#modal-table");
  buttonGroup.addEventListener("click", (e) => {
    if (e.target.id === "increase-btn") updateQuantity("increase", e.target, e);
    if (e.target.id === "decrease-btn") updateQuantity("decrease", e.target, e);
  });
}

function updateQuantity(value, btn, e) {
  e.preventDefault();
  const itemId = btn.value;

  const quantity = btn.parentElement.querySelector("#quantity");
  const item = cart.findIndex((item) => item.id === itemId);
  if (value === "increase") {
    cart[item].quantity += 1;
  } else if (value === "decrease") {
    let count = (cart[item].quantity -= 1);
    if (count === 0) {
      cart.splice(item, 1);
      fillModal();
    }
  }
  if (cart.length > 0) localStorage.setItem("cart", JSON.stringify(cart));
  else localStorage.removeItem("cart");
  updateCartItemCount();
  quantity.textContent = cart[item].quantity;
  updatePrice(itemId, cart[item].price, cart[item].quantity);
  setTimeout(() => {
    calculateTotalAmount();
  }, 100);
}

function updatePrice(itemId, itemPrice, quantity) {
  const priceTds = document.querySelectorAll("#modal-table #price");
  const priceTDbyId = Array.from(priceTds).filter(
    (td) => td.dataset.value === itemId
  );

  priceTDbyId[0].innerHTML = (itemPrice * quantity).toFixed(2);
}
function calculateTotalAmount() {
  const priceTds = document.querySelectorAll("#modal-table #price");
  const totalAmountTD = document.querySelector(
    "#modal-table tfoot #totalAmount"
  );
  let totalAmount = 0;

  priceTds.forEach((item) => {
    totalAmount += Number.parseFloat(item.innerHTML);
  });

  totalAmountTD.innerHTML = totalAmount.toFixed(2) + "&#8378;";
}

async function createOrder() {
  checkCartLocalStorage();
  localStorage.setItem("orders", JSON.stringify(cart));
  clearOrderTable();
  document.location.href = "myorders.html";
}
/**
 * Sepet açıldığında modal'a ürünleri ekle
 */
function fillModal() {
  const modalTable = document.querySelector("#modal-table");
  const tableBody = modalTable.getElementsByTagName("tbody")[0];
  tableBody.innerHTML = "";
  cart.forEach((item) => {
    const product = getProductById(item.id);
    product.then((data) => {
      let price = item.quantity * data.data.price;
      const row = `
      <tr>
      <td>${data.data.name}</td>
      <td>
        <div id="quantitybuttons" class="btn-group" role="group">
        <button id="decrease-btn" type="button" class="btn btn-danger" value="${
          item.id
        }">-</button>
        <button id="quantity" type="text" class="btn btn-warning text-bg-dark" disabled value="${
          item.id
        }">${item.quantity}</button>
        <button id="increase-btn"type="button" class="btn btn-success" value="${
          item.id
        }">+</button>
        </div>
      </td>
      <td id ="price" data-value="${item.id}">${price.toFixed(2)}</td>
      </tr>
      `;
      tableBody.innerHTML += row;
    });
  });
  setTimeout(() => {
    calculateTotalAmount();
  }, 1000);
}

/**
 * Select Option
 */
function getSelectOption() {
  const brandId = document.getElementById("brandSelect").value;
  const url = brandId > 0 ? `model?brandId=${brandId}` : "model";
  fillSelectOption(url, "modelSelect");
}
/**
 * Sepete ekle.
 */
function addToCart(e) {
  const itemPrice =
    e.parentElement.parentElement.parentElement.querySelector(
      "#price"
    ).textContent;
  const addItemId = e.getAttribute("data-value");
  checkCartLocalStorage();

  const filtered = cart.findIndex((item) => item.id === addItemId);

  if (filtered != -1) {
    cart[filtered].quantity = cart[filtered].quantity + 1;
  } else {
    let product = {
      id: addItemId,
      quantity: 1,
      price: Number.parseFloat(itemPrice).toFixed(2),
    };
    cart.push(product);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartItemCount();
}

function goProductDetailPage(e) {
  window.location.href =
    "productDetail.html?pId=" + e.target.getAttribute("data-value");
}
/**
 * Sepetteki ürün sayısını say badge e ekle
 */
function updateCartItemCount() {
  const itemCountElement = document.querySelector("#item-count");
  let localItemCount = 0;
  cart.forEach((item) => {
    localItemCount += item.quantity;
  });
  itemCountElement.textContent = localItemCount;
}

function checkCartLocalStorage() {
  const localStorageCart = localStorage.getItem("cart");
  if (localStorageCart == null) {
    cart = [];
  } else {
    cart = Array.from(JSON.parse(localStorageCart));
  }
  updateCartItemCount();
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

function clearOrderTable() {
  $(orderModal).modal("hide");
  setTimeout(() => {
    localStorage.removeItem("cart");
    orderModal.querySelector("tbody").innerHTML = "";
    document.querySelector("#item-count").innerHTML = "0";
    document.location.href = "myorders.html";
  }, 3000);
}
