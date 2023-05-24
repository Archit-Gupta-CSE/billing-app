const form = document.getElementById('billForm');

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
    now.getMonth().toString().padStart(2, '0') +
    '0000';
  billNumberField.value = defaultBillNumber;
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
  ipcRenderer.send('formSubmit', data);

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
});
