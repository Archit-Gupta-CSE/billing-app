const printButton = document.getElementById('printForm');
const fontSize = 14;
const { PDFDocument, rgb, StandardFonts } = PDFLib;

printButton.addEventListener('click', async event => {
  event.preventDefault();
  const pdfData = {};
  const formData = new FormData(form);
  for (let [key, value] of formData.entries()) {
    pdfData[key] = value;
  }
  const response = await fetch('assets/bill.pdf');
  const pdfBytes = await response.arrayBuffer();

  const pdfDoc = await PDFDocument.load(pdfBytes);

  const page = pdfDoc.getPages()[0];
  const { width, height } = page.getSize();
  const fontFamily = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // --- Name ---
  page.drawText('Name: ', {
    x: 53,
    y: height - 12.2 * fontSize,
    size: fontSize,
    font: fontFamily,
  });

  page.drawText(
    pdfData['initials'] +
      '. ' +
      pdfData['firstName'] +
      ' ' +
      pdfData['lastName'],
    {
      x: 102,
      y: height - 12.2 * fontSize,
      size: fontSize,
    }
  );
  page.drawText('...............................', {
    x: 97,
    y: height - 12.4 * fontSize,
    size: fontSize,
  });

  // --- Age ---
  page.drawText('Age: ', {
    x: 53,
    y: height - 13.7 * fontSize,
    size: fontSize,
    font: fontFamily,
  });

  page.drawText(pdfData['age'], {
    x: 102,
    y: height - 13.7 * fontSize,
    size: fontSize,
  });
  page.drawText('.........', {
    x: 97,
    y: height - 13.9 * fontSize,
    size: fontSize,
  });

  //-- Date --

  page.drawText('Date: ', {
    x: 415,
    y: height - 12.2 * fontSize,
    size: fontSize,
    font: fontFamily,
  });
  page.drawText(pdfData['date'], {
    x: 467,
    y: height - 12.2 * fontSize,
    size: fontSize,
  });
  page.drawText('.......................', {
    x: 460,
    y: height - 12.4 * fontSize,
    size: fontSize,
  });

  //-- RGID --

  page.drawText('RGID: ', {
    x: 415,
    y: height - 13.7 * fontSize,
    size: fontSize,
    font: fontFamily,
  });
  page.drawText(pdfData['billNumber'], {
    x: 470,
    y: height - 13.7 * fontSize,
    size: fontSize,
    color: rgb(1, 0, 0),
    font: fontFamily,
  });
  page.drawText('.......................', {
    x: 460,
    y: height - 13.9 * fontSize,
    size: fontSize,
  });

  //-- sex --
  page.drawText('Sex: ', {
    x: 143,
    y: height - 13.7 * fontSize,
    size: fontSize,
    font: fontFamily,
  });

  page.drawText(pdfData['sex'], {
    x: 187,
    y: height - 13.7 * fontSize,
    size: fontSize,
  });
  page.drawText('...............', {
    x: 177,
    y: height - 13.9 * fontSize,
    size: fontSize,
  });
  // //-- Amount Paid --

  // page.drawText('Consultation Charges(Paid): ', {
  //   x: 297,
  //   y: height - 55.2 * fontSize,
  //   size: fontSize,
  //   font: fontFamily,
  // });

  // page.drawText(pdfData['newPrice'], {
  //   x: 502,
  //   y: height - 55.2 * fontSize,
  //   size: fontSize,
  //   font: fontFamily,
  // });
  // page.drawText('..................', {
  //   x: 492,
  //   y: height - 55.4 * fontSize,
  //   size: fontSize,
  // });
  const modifiedPdfBytes = await pdfDoc.save();
  const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });

  const url = URL.createObjectURL(blob);

  window.open(url, '_blank');
});
