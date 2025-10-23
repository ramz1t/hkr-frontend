const fields = [
    [nameInput, val => /^[A-Za-z\s]+$/.test(val), "Name must only contain letters."],
    [emailInput, val => val.includes("@") && val.includes("."), "Invalid email format."],
    [confirmCheckbox, val => val === true, "You must confirm before sending."]
];

function validateForm() {
    let message = "";
    let hasError = false;
    for (const [el, check, msg] of fields) {
        const value = el.type === "checkbox" ? el.checked : el.value.trim();
        const errorSlot = el.nextElementSibling;

        const isErrorSlot = errorSlot && errorSlot.classList.contains("error-slot");

        if (isErrorSlot) errorSlot.textContent = "";

        if (value === "" || value === undefined || value === null) {
            hasError = true;
            continue;
        }

        if (!check(value)) {
            hasError = true;
            if (isErrorSlot) errorSlot.textContent = msg;
        }
    }
    sendBtn.disabled = hasError;
}

fields.forEach(([el]) => el.addEventListener("input", validateForm));
fields.forEach(([el]) => el.addEventListener("change", validateForm));
contactForm.addEventListener("submit", e => {
    e.preventDefault();
    alert("submit");
})

validateForm();