(() => {
  document.querySelectorAll("form.lead-form").forEach(form => {
    const phone = form.elements.phoneNumber;
    const email = form.elements.emailAddress;

    function validatePhone() {
      phone.setCustomValidity("");
      if (!phone.value.trim()) return;
      const number = libphonenumber.parsePhoneNumberFromString(phone.value.trim(), {
        defaultCountry: "US",
        extract: false
      });
      if (!number || number.countryCallingCode !== "1" || !number.isValid()) {
        phone.setCustomValidity("Enter a valid phone number with its area code, such as (281) 397-6614.");
        return;
      }
      return number;
    }

    function validateEmail() {
      email.setCustomValidity("");
      email.value = email.value.trim();
      if (!email.value) return;
      const address = email.value;
      const parts = address.split("@");
      const domain = parts[1] || "";
      const labels = domain.split(".");
      const validDomain = labels.length >= 2 && labels.every(label =>
        /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label)
      ) && /^[a-z]{2,}$/i.test(labels[labels.length - 1]);
      if (email.validity.typeMismatch || parts.length !== 2 ||
          !parts[0] || parts[0].startsWith(".") || parts[0].endsWith(".") ||
          parts[0].includes("..") || !validDomain) {
        email.setCustomValidity("Enter a complete email address, such as name@example.com.");
      }
    }

    phone.addEventListener("input", () => {
      const cursor = phone.selectionStart;
      const digitsBeforeCursor = phone.value.slice(0, cursor).replace(/\D/g, "").length;
      const formatter = new libphonenumber.AsYouType("US");
      phone.value = formatter.input(phone.value);
      let position = 0;
      let digits = 0;
      while (position < phone.value.length && digits < digitsBeforeCursor) {
        if (/\d/.test(phone.value[position])) digits++;
        position++;
      }
      phone.setSelectionRange(position, position);
      validatePhone();
    });
    phone.addEventListener("blur", () => {
      const number = validatePhone();
      if (number) phone.value = number.formatNational();
      if (!phone.validity.valid) phone.reportValidity();
    });
    email.addEventListener("input", validateEmail);
    // Validate autofilled values before the browser runs its native checks.
    form.querySelector('button[type="submit"]').addEventListener("click", () => {
      validatePhone();
      validateEmail();
    });
    form.addEventListener("submit", event => {
      validatePhone();
      validateEmail();
      if (!form.reportValidity()) event.preventDefault();
    });
    validatePhone();
    validateEmail();
  });
})();