const validateName = (name: string): boolean => {
  // Permite letras, espacios y tildes. Mínimo 2 caracteres, máximo 50.
  const nameRegex =
    /^[a-zA-ZÀ-ÿ\u00f1\u00d1]{2,}([ ]?[a-zA-ZÀ-ÿ\u00f1\u00d1]{2,})*$/;
  return nameRegex.test(name.trim());
};

export default validateName;
