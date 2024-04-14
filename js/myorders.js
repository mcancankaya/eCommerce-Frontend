import { getProductById, createOrderPost, getById } from "./api.js";
import { getUserId, isLogin } from "./auth.js";

const createOrderBTN = document.querySelector("#createOrder");
const cancelorderBTN = document.querySelector("#CancelOrder");
const alertBox = document.querySelector("#alert-box");
const orderTable = document.querySelector("#order-table");
const oldOrderAccordion = document.querySelector("#myorderAccordions");

let orderCart = [];
document.addEventListener("DOMContentLoaded", function () {
  isLogin();
  fillOldOrders();
  fillOrderTable();
  modalQuantityButtonsEvent();
  createOrderEvent();
  cancelorderBTNEvent();
});
function cancelorderBTNEvent() {
  cancelorderBTN.addEventListener("click", function () {
    localStorage.removeItem("orders");
    document.location.reload();
    cancelorderBTN.hidden = true;
  });
}
function createOrderEvent() {
  createOrderBTN.addEventListener("click", function () {
    createOrder();
  });
}

function modalQuantityButtonsEvent() {
  const buttonGroup = document.querySelector("#order-table");
  buttonGroup.addEventListener("click", (e) => {
    if (e.target.id === "increase-btn") updateQuantity("increase", e.target, e);
    if (e.target.id === "decrease-btn") updateQuantity("decrease", e.target, e);
  });
}

async function createOrder() {
  const orderItems = [];
  orderCart.forEach((item) => {
    orderItems.push({
      productId: item.id,
      quantity: item.quantity,
    });
  });
  const createOrderRequest = {
    userId: getUserId(),
    orderItems: orderItems,
  };

  const response = await createOrderPost(createOrderRequest);
  if (response.status) {
    showAlert(
      "success",
      response.message +
        " 3 saniye içinde yönlendirileceksiniz lütfen bekleyin."
    );
    clearOrderTable();
  } else {
    showAlert("danger", response.message);
  }
}

function fillOrderTable() {
  const modalTable = document.querySelector("#order-table");
  const tableBody = modalTable.getElementsByTagName("tbody")[0];
  tableBody.innerHTML = "";
  checkCartLocalStorage();
  if (orderCart.length == 0) {
    tableBody.innerHTML = "<tr>Sepetinizi oluşturup onaylayın.</tr>";
    createOrderBTN.disabled = true;
    cancelorderBTN.disabled = true;
  }
  cancelorderBTN.hidden = false;
  orderCart.forEach((item) => {
    const myorders = getProductById(item.id);
    myorders.then((data) => {
      let price = item.quantity * data.data.price;
      const row = `
        <tr>
        <td>${data.data.id}</td>
        <td>${data.data.name}</td>

        <td id ="price" data-value="${item.id}">${price.toFixed(2)}</td>
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
        </tr>
        `;
      tableBody.innerHTML += row;
    });
  });
  setTimeout(() => {
    calculateTotalAmount();
  }, 1000);
}
function updateQuantity(value, btn, e) {
  e.preventDefault();
  const itemId = btn.value;

  const quantity = btn.parentElement.querySelector("#quantity");
  const item = orderCart.findIndex((item) => item.id === itemId);
  if (value === "increase") {
    orderCart[item].quantity += 1;
  } else if (value === "decrease") {
    let count = (orderCart[item].quantity -= 1);
    if (count === 0) {
      orderCart.splice(item, 1);
      fillOrderTable();
    }
  }
  if (orderCart.length > 0)
    localStorage.setItem("orders", JSON.stringify(orderCart));
  else localStorage.removeItem("orders");
  quantity.textContent = orderCart[item].quantity;
  updatePrice(itemId, orderCart[item].price, orderCart[item].quantity);
  setTimeout(() => {
    calculateTotalAmount();
  }, 100);
}
function updatePrice(itemId, itemPrice, quantity) {
  const priceTds = document.querySelectorAll("#order-table #price");
  const priceTDbyId = Array.from(priceTds).filter(
    (td) => td.dataset.value === itemId
  );

  priceTDbyId[0].innerHTML = (itemPrice * quantity).toFixed(2);
}

function checkCartLocalStorage() {
  const localStorageCart = localStorage.getItem("orders");
  if (localStorageCart == null) {
    orderCart = [];
  } else {
    orderCart = Array.from(JSON.parse(localStorageCart));
  }
}
function calculateTotalAmount() {
  const priceTds = document.querySelectorAll("#order-table #price");
  const totalAmountTD = document.querySelector(
    "#order-table tfoot #totalAmount"
  );
  let totalAmount = 0;

  priceTds.forEach((item) => {
    totalAmount += Number.parseFloat(item.innerHTML);
  });

  totalAmountTD.innerHTML = totalAmount.toFixed(2) + "&#8378;";
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
  setTimeout(() => {
    localStorage.removeItem("cart");
    localStorage.removeItem("orders");
    orderTable.querySelector("tbody").innerHTML = "";
    document.location.href = "myorders.html";
  }, 3000);
}

async function fillOldOrders() {
  const userId = JSON.parse(localStorage.getItem("authInfo")).userId;
  const response = await getById("order/user", userId);
  oldOrderAccordion.innerHTML = "";
  if (response.status) {
    response.data.forEach((item) => {
      const orderItems = item.orderItems
        .map((oi) => {
          return `
            <tr>
              <td>${oi.product.id}</td>
              <td>${oi.product.name}</td>
              <td>${oi.product.price.toFixed(2)}&#8378;</td>
              <td>${oi.quantity}</td>
            </tr>`;
        })
        .join("");

      const order = `
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button
                class="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#panelsStayOpen-${item.id}"
                aria-expanded="true"
                aria-controls="panelsStayOpen-${item.id}"
              >
              <div class="d-flex justify-content-between align-items-center w-100">
              <div>
                Sipariş No : ${item.id}
              </div>

              <div> Sipariş Tarihi : ${new Date(
                item.orderDate
              ).toLocaleString()} </div>
              <div>
              Toplam Tutar :  ${item.totalAmount.toFixed(2)} &#8378;
             </div>
            </div>
              </button>
              </h2>

            <div
              id="panelsStayOpen-${item.id}"
              class="accordion-collapse collapse show"
            >
              <div class="accordion-body">
                <table class="table table-warning table-hover">
                  <thead>
                    <tr>
                      <th>ÜRÜN ID</th>
                      <th>ÜRÜN ADI</th>
                      <th>ÜRÜN FİYATI</th>
                      <th>SİPARİŞ ADETİ</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${orderItems}
                  </tbody>
                </table>
              </div>
            </div>
          </div>`;
      oldOrderAccordion.innerHTML += order;
    });
  }
}
