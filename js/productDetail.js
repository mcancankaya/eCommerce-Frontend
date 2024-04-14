import { BASE_URL, isLogin } from "./auth.js";

const productDetailSection = document.getElementById("productDetailSection");

document.addEventListener("DOMContentLoaded", function () {
  let query = document.location.search;
  let param = new URLSearchParams(query);
  let productId = param.get("pId");
  isLogin();
  getProductDetail(productId);
});

async function getProductDetail(productId) {
  productDetailSection.innerHTML = "";
  const response = await fetch(
    BASE_URL.concat("product/").concat(productId)
  ).then((res) => res.json());
  if (response.status) {
    const product = response.data;
    const innerHtml = `
        <div class="col-md-6 border">
            <img
              class="card-img-top mb-5 mb-md-0"
              src="${
                product.imageUrl != null ? product.imageUrl : "imgs/default.png"
              }"
              alt="${product.name}"
            />
          </div>
          <div class="col-md-6 border border-info border-3">
            <div class="small mb-1">${product.id}</div>
            <h1 class="display-7 fw-semibold">${product.name}</h1>
            <hr>
            <div class="fs-5 mb-5 ">
            
              <span>  ${product.price.toFixed(2)} &#8378;</span>
            </div>
            <p class="lead">
                <strong><em>Ürün Detayları</em></strong></br><hr>
              ${product.description}
            </p>
            <hr>
            <div class="d-flex">
            <label for="inputQuantity"><strong><em>Stok Adeti</em></strong> : ${
              product.stockAmount
            } adet</label>
            </div>
          </div>`;
    productDetailSection.innerHTML = innerHtml;
  }
}
