interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

const validatePassword = (password: string): PasswordValidation => {
  const errors: string[] = [];

  // 1. Validar Longitud (6 a 100 caracteres)
  if (password.length < 6 || password.length > 40) {
    errors.push("Debe tener entre 6 y 40 caracteres.");
  }

  // 2. Validar Mayúsculas (incluye Ñ)
  if (!/[A-ZÑ]/.test(password)) {
    errors.push("Al menos una letra mayúscula.");
  }

  // 3. Validar Minúsculas (incluye ñ)
  if (!/[a-zñ]/.test(password)) {
    errors.push("Al menos una letra minúscula.");
  }

  // 4. Validar Números
  if (!/\d/.test(password)) {
    errors.push("Al menos un número.");
  }

  // 5. Validar Caracteres Especiales
  const specialCharsRegex = /[!@#$%^&*()_+=\-\[\]{};:'",.<>\/?|\\~`]/;
  if (!specialCharsRegex.test(password)) {
    errors.push("Al menos un carácter especial (ej: !@#$).");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default validatePassword;
