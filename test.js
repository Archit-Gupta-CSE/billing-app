window.addEventListener('load', () => {
  var now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

  /* remove second/millisecond if needed - credit ref. https://stackoverflow.com/questions/24468518/html5-input-datetime-local-default-value-of-today-and-current-time#comment112871765_60884408 */
  now.setMilliseconds(null);
  now.setSeconds(null);

  document.getElementById('cal').value = now.toISOString().slice(0, -1);
});
var billCount = 1; // Initial bill count
var defaultBillNumber = 'B0001'; // Default bill number

document
  .getElementById('billForm')
  .addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form submission

    var formInputs = document
      .getElementById('billForm')
      .getElementsByTagName('input');
    for (var i = 0; i < formInputs.length; i++) {
      if (formInputs[i].id !== 'billNumber') {
        formInputs[i].value = '';
      }
    }

    var billNumberField = document.getElementById('billNumber');
    if (billNumberField.value === '') {
      billNumberField.value = defaultBillNumber;
    } else {
      billCount++; // Increment bill count
      var newBillNumber = 'B' + billCount.toString().padStart(4, '0');
      billNumberField.value = newBillNumber;
    }
    var now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

    /* remove second/millisecond if needed - credit ref. https://stackoverflow.com/questions/24468518/html5-input-datetime-local-default-value-of-today-and-current-time#comment112871765_60884408 */
    now.setMilliseconds(null);
    now.setSeconds(null);

    document.getElementById('cal').value = now.toISOString().slice(0, -1);
  });
