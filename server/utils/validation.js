const nameRegex = /^.{20,60}$/;
const addressMaxLength = 400;
const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{8,16}$/;
const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

export function validateName(name) {
  return typeof name === "string" && nameRegex.test(name.trim());
}

export function validateAddress(address) {
  if (address == null) return true;
  return typeof address === "string" && address.length <= addressMaxLength;
}

export function validatePassword(password) {
  return typeof password === "string" && passwordRegex.test(password);
}

export function validateEmail(email) {
  return typeof email === "string" && emailRegex.test(email.toLowerCase());
}

