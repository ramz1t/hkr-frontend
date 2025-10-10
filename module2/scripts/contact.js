const fields = [
    [nameInput, val => /^[A-Za-z\s]+$/.test(val), "Name must not contain numbers."],
    [emailInput, val => val.includes("@") && val.includes("."), "Invalid email format."],
    [confirmCheckbox, val => val === true, "You must confirm before sending."]
];

function validateForm() {
    let message = "";
    let hasError = false;
    for (const [el, check, msg] of fields) {
        const value = el.type === "checkbox" ? el.checked : el.value.trim();
        if (value === undefined || value === null || value === "") {
            hasError = true;
            continue;
        }
        if (!check(value)) {
            message = message + msg + "\n";
            hasError = true;
        }
    }
    if (hasError) {
        errorMsg.textContent = message;
        sendBtn.disabled = true;
    } else {
        errorMsg.textContent = "";
        sendBtn.disabled = false;
    }
    return !hasError
}

fields.forEach(([el]) => el.addEventListener("input", validateForm));
fields.forEach(([el]) => el.addEventListener("change", validateForm));

validateForm();


contactForm.addEventListener("submit", e => {
    e.preventDefault();
    alert("submit");
})