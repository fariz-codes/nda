const alphaNumericRegex = "^[a-zA-Z0-9_]*$";
const passwordRegex = "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,16}$";

const validateCredentials = (username, password) => {
  let errMsg = '';
  let status = false;

  if (username && password) {
    if (username.length > 2) {
      if (username.match(alphaNumericRegex)) {
        if (password.match(passwordRegex)) {
          status = true;
        } else {
          errMsg = "Password doesn't satisfy the requirements. Please update your password based on the below password policy.\n\n* Password must contains one uppercase and one lowercase letter\n* Password must contains atleast one number and one special character\n* Password must be minimum of 8 characters and maximum of 16 characters";
        }
      } else {
        errMsg = 'Username must contains only alphabets & numbers';
      }
    } else {
      errMsg = 'Username must be minimum of 3 characters';
    }
  } else {
    errMsg = 'Username & password are required';
  }

  return { status, errMsg };
};

module.exports = {
  validateCredentials
};