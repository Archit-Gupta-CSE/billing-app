const printButton = document.getElementById("printForm");
const fontSize = 14;
const { PDFDocument } = PDFLib;

printButton.addEventListener("click", async (event) => {
  event.preventDefault();
  const pdfData = {};
  const formData = new FormData(form);
  for (let [key, value] of formData.entries()) {
    pdfData[key] = value;
  }
  const response = await fetch("assets/bill.pdf");
  const pdfBytes = await response.arrayBuffer();

  const pdfDoc = await PDFDocument.load(pdfBytes);

  const page = pdfDoc.getPages()[0];
  const { width, height } = page.getSize();

  // --- Name ---
  page.drawText("Name: ", {
    x: 55,
    y: height - 10 * fontSize,
    size: fontSize,
  });

  page.drawText(pdfData["firstName"] + " " + pdfData["lastName"], {
    x: 100,
    y: height - 10 * fontSize,
    size: fontSize,
  });

  // --- Age ---
  page.drawText("Age: ", {
    x: 55,
    y: height - 11.2 * fontSize,
    size: fontSize,
  });

  page.drawText(pdfData["age"], {
    x: 90,
    y: height - 11.2 * fontSize,
    size: fontSize,
  });

  const modifiedPdfBytes = await pdfDoc.save();
  const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });

  const url = URL.createObjectURL(blob);

  window.open(url, "_blank");
});
