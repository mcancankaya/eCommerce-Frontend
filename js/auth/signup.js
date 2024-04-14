import { signUpRequest } from "../auth.js";

const signupForm = document.getElementById("signupForm");
const firstNameElement = document.getElementById("firstname");
const lastNameElement = document.getElementById("lastname");
const emailElement = document.getElementById("email");
const passwordElement = document.getElementById("password");

document.addEventListener("DOMContentLoaded", function () {
  addFormValidEvent();
});

function addFormValidEvent() {
  signupForm.addEventListener("submit", function (event) {
    if (!this.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
      this.classList.add("was-validated");
    } else {
      event.preventDefault();
      signUp();
      signupForm.reset();
      this.classList.remove("was-validated");
    }
  });
}

function getFormData() {
  let newUser = {
    firstName: firstNameElement.value.trim(),
    lastName: lastNameElement.value.trim(),
    email: emailElement.value.trim(),
    password: passwordElement.value.trim(),
  };
  return newUser;
}
async function signUp() {
  const user = getFormData();
  const response = await signUpRequest(user);
  console.log(response);
  if (response.status) {
    alert(
      "Kayıt işlemi başarılı. Giriş sayfasına yönlendiriliyorsunuz lütfen bekleyiniz."
    );
    document.location.href = "signin.html";
  } else {
    alert("Kayıt Başarısız.\n", response.message);
  }
}
