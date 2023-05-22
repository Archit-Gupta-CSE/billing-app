const form = document.getElementById('billForm'); // Replace 'billForm' with your form ID

// Handle form submission
form.addEventListener('submit', event => {
  event.preventDefault(); // Prevent default form submission

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Send the form data to the main process
});
