export const BASE_URL = "http://localhost:8080/api/v1/";

export function signUpRequest(user) {
  const response = fetch(BASE_URL.concat("auth/signup"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  }).then((res) => res.json());

  return response;
}

export async function signInRequest(user) {
  let response = await fetch(BASE_URL.concat("auth/signin"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  }).then((res) => {
    if (!res.ok) {
      throw new Error("Giriş Başarısız");
    } else {
      return res.json();
    }
  });

  return response;
}

export function setAuthInfoLocalStorage(jwt, refresh, id) {
  let authInfo = {
    userId: id,
    jwtToken: jwt,
    refreshToken: refresh,
  };
  localStorage.setItem("authInfo", JSON.stringify(authInfo));
}

export function getJwtToken() {
  return JSON.parse(localStorage.getItem("authInfo"));
}

export function getRefreshToken() {
  return JSON.parse(localStorage.getItem("authInfo")).refreshToken;
}

export function checkUserIsAuthenticated() {
  const authInfo = localStorage.getItem("authInfo");
  if (
    authInfo != null &&
    authInfo.refreshToken !== undefined &&
    authInfo !== null
  )
    refreshTokenRequest();
  else {
    window.location.href = "signin.html";
  }
}

async function refreshTokenRequest() {
  const token = getRefreshToken();
  await fetch(BASE_URL.concat("/auth/refreshToken"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: { token: token },
  })
    .then((res) => {
      if (!res.ok) throw new Error(res.status);
      else {
        return res.json();
      }
    })
    .then((response) => {
      if (response.status) {
        setAuthInfoLocalStorage(
          response.data.jwtToken,
          response.data.refreshToken
        );
        windows.location.href = "index.html";
      }
    })
    .catch((err) => {
      if (err.message === "403") {
        checkUserIsAuthenticated();
      }
    });
}

export function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace("-", "+").replace("_", "/");
  const decodedData = JSON.parse(atob(base64));
  const userRole = decodedData.authorities[0];
  console.log(userRole);
  return userRole;
}

export function getRole() {
  const token = JSON.parse(localStorage.getItem("authInfo")).jwtToken;
  const role = parseJwt(token);
  return role;
}

export function getDefaultHeaders() {
  let token = JSON.parse(localStorage.getItem("authInfo")).jwtToken;
  let headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  };
  return headers;
}
export function getUserId() {
  let id = JSON.parse(localStorage.getItem("authInfo")).userId;
  return id;
}

export function isLogin() {
  document.getElementById("login-button").hidden = true;

  const logoutbtn = document.getElementById("logout-button");
  logoutbtn.hidden = false;
  logoutbtn.addEventListener("click", function () {
    logout();
  });
  let role = getRole();
  if (role == "ADMIN") {
    const container = document.getElementById("loginlogoutcontainer");
    const adminPanelButton = document.createElement("a");
    adminPanelButton.classList.add("btn", "btn-outline-warning", "ms-3");
    adminPanelButton.type = "button";
    adminPanelButton.textContent = "ADMIN PANELI";
    adminPanelButton.href = "admin.html";
    adminPanelButton.hidden = false;

    container.append(adminPanelButton);
  }
}
export function logout() {
  localStorage.removeItem("authInfo");
}
export function isAdmin() {
  const role = getRole();
  if (role != "ADMIN") {
    return (document.location.href = "index.html");
  }
}
