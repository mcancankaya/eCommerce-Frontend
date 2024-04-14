import { signInRequest, setAuthInfoLocalStorage } from "../auth.js";

let signInForm = document.getElementById("signinForm");
let emailElement = document.getElementById("email");
let passwordElement = document.getElementById("password");

document.addEventListener("DOMContentLoaded", function () {
  addFormValidEvent();
});
function addFormValidEvent() {
  signInForm.addEventListener("submit", function (event) {
    if (!this.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
      this.classList.add("was-validated");
    } else {
      event.preventDefault();
      signIn();
      signInForm.reset();
      this.classList.remove("was-validated");
    }
  });
}

function getFormData() {
  let signinUser = {
    email: emailElement.value.trim(),
    password: passwordElement.value.trim(),
  };
  return signinUser;
}

async function signIn() {
  let user = getFormData();
  try {
    let response = await signInRequest(user);
    if (response.status) {
      setAuthInfoLocalStorage(
        response.data.token,
        response.data.refreshToken,
        response.data.userId
      );

      alert("Giriş işlemi başarılı");
      var role = getRole(response.data.token);
      console.log(role);
      if (role == "ADMIN") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "index.html";
      }
    }
  } catch (err) {
    alert("Giriş Başarısız.\n", err.message);
  }
}
function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace("-", "+").replace("_", "/");
  var decodedData = JSON.parse(atob(base64));
  var userRole = decodedData.authorities[0];
  return userRole;
}

function getRole() {
  var token = JSON.parse(localStorage.getItem("authInfo")).jwtToken;
  var role = parseJwt(token);
  return role;
}
