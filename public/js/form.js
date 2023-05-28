const form = document.getElementById('billForm');
const searchWithPhone = document.getElementById('phoneSearch');
const phoneInput = document.getElementById('validationDefaultPhone');
const resetForm = document.getElementById('resetForm');

var now = new Date();
var billCount = 0; // Initial bill count
var defaultBillNumber =
  now.getFullYear().toString().slice(-2) +
  (now.getMonth() + 1).toString().padStart(2, '0') +
  '0000'; // Default bill number

window.addEventListener('load', () => {
  // Get the current system time
  var now = new Date();
  var hours = now.getHours();
  var minutes = now.getMinutes();

  // Format the time as "HH:mm"
  var formattedTime =
    (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;

  // Set the default value for the time input
  var timeInput = document.getElementById('timeInput');
  timeInput.value = formattedTime;

  // Get the date input element
  var dateInput = document.getElementById('dateInput');
  // Format the date as "YYYY-MM-DD" and set it as the default value of the date input
  var formattedDate = now.toISOString().slice(0, 10);
  dateInput.value = formattedDate;
  var billNumberField = document.getElementById('billNumber');
  var defaultBillNumber =
    now.getFullYear().toString().slice(-2) +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    '0000';
  billNumberField.value = defaultBillNumber;
  var price = document.getElementById('newPrice');
  var defaultPrice = 'Rs. 400';
  price.value = defaultPrice;
});

form.addEventListener('submit', function (event) {
  event.preventDefault(); // Prevent form submission
  // Get the current system time
  // Get the form values
  const formData = new FormData(form);

  // Convert form data to an object
  const data = {};
  for (let [key, value] of formData.entries()) {
    data[key] = value;
  }

  // Send the form data to the main process
  ipcRenderer.sendFormData(data);
  showAlert('Submitted SuccessFully!!');
});

searchWithPhone.addEventListener('click', event => {
  event.preventDefault();

  const phoneNumber = phoneInput.value;

  ipcRenderer.sendPhoneInfo(phoneNumber);
});

ipcRenderer.receiveUserInfo(response => {
  console.log(response);
  if (response) {
    const f2 = document.querySelector('#billForm');
    const radio2 = document.getElementsByName('sex');
    Object.entries(response).forEach(([key, value2]) => {
      const input = f2.querySelector(`[name="${key}"]`);
      if (input) {
        input.value = value2;
      }
      if (key === 'sex') {
        for (const radioButton of radio2) {
          if (radioButton.value === value2) {
            // Update the checked property based on the retrieved value
            radioButton.checked = true;
          } else {
            radioButton.checked = false;
          }
        }
      }
    });
  } else {
    showAlert("User doesn't exists!!");
  }
  var text23 = document.getElementById('PandC');
  text23.value = 'Consultation Charges (fixed) ';
});

function showAlert(message, alertType) {
  // Create the alert element
  const alertElement = document.createElement('div');
  alertElement.classList.add('alert', `alert-${alertType}`);
  alertElement.textContent = message;

  // Append the alert element to the container
  const alertContainer = document.getElementById('alertContainer');
  alertContainer.appendChild(alertElement);

  // Automatically dismiss the alert after a certain time (optional)
  setTimeout(() => {
    alertElement.remove();
  }, 3000); // 3000 milliseconds = 3 seconds (adjust as needed)
  // Position the alert near the top-right corner
  const windowWidth = window.innerWidth;
  const alertWidth = alertElement.offsetWidth;
  const alertHeight = alertElement.offsetHeight;

  const alertPositionX = windowWidth - alertWidth - 10;
  const alertPositionY = 10;

  alertElement.style.position = 'fixed';
  alertElement.style.right = `${alertPositionX}px`;
  alertElement.style.top = `${alertPositionY}px`;
  alertElement.style.backgroundColor = 'white';
  alertElement.style.border = '1px solid black';
}

resetForm.addEventListener('click', event => {
  event.preventDefault();
  var now = new Date();
  var formInputs = form.getElementsByTagName('input');

  for (var i = 0; i < formInputs.length; i++) {
    if (formInputs[i].id !== 'billNumber') {
      formInputs[i].value = '';
    }
  }

  var selectElement = document.getElementById('inputState');
  selectElement.selectedIndex = 0;
  var selectElement = document.getElementById('inputDistrict');
  selectElement.selectedIndex = 0;

  var billNumberField = document.getElementById('billNumber');
  if (billNumberField.value === '') {
    billNumberField.value = defaultBillNumber;
  } else {
    billCount++; // Increment bill count
    var newBillNumber =
      now.getFullYear().toString().slice(-2) +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      billCount.toString().padStart(4, '0');
    billNumberField.value = newBillNumber;
  }

  var hours = now.getHours();
  var minutes = now.getMinutes();

  // Format the time as "HH:mm"
  var formattedTime =
    (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;

  // Set the default value for the time input
  var timeInput = document.getElementById('timeInput');
  timeInput.value = formattedTime;

  // Get the date input element
  var dateInput = document.getElementById('dateInput');
  // Format the date as "YYYY-MM-DD" and set it as the default value of the date input
  var formattedDate = now.toISOString().slice(0, 10);
  dateInput.value = formattedDate;
  var text23 = document.getElementById('PandC');
  text23.value = 'Consultation Charges (fixed) ';
  var price = document.getElementById('newPrice');
  var defaultPrice = 'Rs. 400';
  price.value = defaultPrice;
});
