/**
 * @author Laleth I N <laleth.kumar@solitontech.com>
 */

//import user from "../data/user_details.json" assert { type: "json" };

const LOGIN_REFS = {
  userName: document.querySelector(".username-input"),
  password: document.querySelector(".password-input"),
  loginButton: document.querySelector(".login"),
  signupButton: document.querySelector(".signup"),
  signupBox: document.querySelector(".signup-box"),
  closeButton: document.querySelector(".close"),
  newUser: document.querySelector(".signup-form > .username-input"),
  newPassword: document.querySelector(".signup-form > .password-input"),
  registerButton: document.querySelector(".register"),
  error: document.querySelector(".error"),
};
const LOGIN_URL = "http://localhost:8000/login";
const SIGNUP_URL = "http://localhost:8000/signup";
let users = {};
let uniqueId = 0;

(function () {
  LOGIN_REFS.loginButton.addEventListener("click", validateAndLogin);
  LOGIN_REFS.signupButton.addEventListener("click", openSignupBox);
})();

async function validateAndLogin() {
  let body = ` {"userName": "${LOGIN_REFS.userName.value}","password":"${LOGIN_REFS.password.value}"}`;

  if (LOGIN_REFS.userName.value === "") {
    LOGIN_REFS.userName.style.border = "2px solid red";
    LOGIN_REFS.error.style.visibility = "visible";
  } else if (LOGIN_REFS.password.value === "") {
    LOGIN_REFS.userName.style.border = "none";
    LOGIN_REFS.password.style.border = "2px solid red";
    LOGIN_REFS.error.style.visibility = "visible";
  } else {
    let result = await postToUrl(LOGIN_URL, body);
    if (result.message) {
      alert("Something went wrong");
    } else if (result.userName && result.password) {
      LOGIN_REFS.userName.style.border = "none";
      LOGIN_REFS.password.style.border = "none";
      LOGIN_REFS.error.style.visibility = "hidden";
      const MAIN_URL = `http://localhost:8000/main?user=${LOGIN_REFS.userName.value}`;
      window.location.replace(MAIN_URL);
    } else if (result.userName) {
      LOGIN_REFS.password.style.border = "2px solid red";
      LOGIN_REFS.error.style.visibility = "visible";
    } else {
      LOGIN_REFS.userName.style.border = "2px solid red";
      LOGIN_REFS.password.style.border = "2px solid red";
      LOGIN_REFS.error.style.visibility = "visible";
    }
  }
}

function openSignupBox() {
  LOGIN_REFS.signupBox.style.visibility = "visible";
  LOGIN_REFS.closeButton.addEventListener("click", () => {
    LOGIN_REFS.signupBox.style.visibility = "hidden";
  });
  LOGIN_REFS.registerButton.addEventListener("click", checkAndRegisterNewUser);
}

async function checkAndRegisterNewUser() {
  let body = `{"userName": "${LOGIN_REFS.newUser.value}","password": "${LOGIN_REFS.newPassword.value}"}`;

  if (LOGIN_REFS.newUser.value === "" && LOGIN_REFS.newPassword.value === "") {
    LOGIN_REFS.newUser.style.border = "2px solid red";
    LOGIN_REFS.newPassword.style.border = "2px solid red";
  } else if (LOGIN_REFS.newUser.value === "") {
    LOGIN_REFS.newUser.style.border = "2px solid red";
  } else if (LOGIN_REFS.newPassword.value === "") {
    LOGIN_REFS.newPassword.style.border = "2px solid red";
  } else {
    let result = await postToUrl(SIGNUP_URL, body);
    alert(result.message);
  }
}

async function postToUrl(url, body) {
  let response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body,
  });

  if (response.ok) {
    return response.json();
  } else {
    return { message: "Something went wrong" };
  }
}
