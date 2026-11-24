const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isThaparEmail = (email) => {
  return (
    typeof email === "string" &&
    isValidEmail(email) &&
    email.trim().toLowerCase().endsWith("@thapar.edu")
  );
};

const isValidCGPA = (cgpa) => {
  return Number(cgpa) >= 0 && Number(cgpa) <= 10;
};

module.exports = {
  isValidEmail,
  isThaparEmail,
  isValidCGPA,
};
