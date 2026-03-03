function validateEmail(email) {
  if (typeof email !== 'string') {
    return false;
  }

  const trimmed = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(trimmed);
}

module.exports = {
  validateEmail,
};
