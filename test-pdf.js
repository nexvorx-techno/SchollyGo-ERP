const PDFDocument = require('pdfkit');

try {
  const doc = new PDFDocument({ margin: 50 });
  let buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {
    const pdfData = Buffer.concat(buffers);
    console.log("PDF generated successfully. Size:", pdfData.length);
  });
  doc.on('error', (err) => {
    console.error("PDF generation error:", err);
  });

  doc.fontSize(24).font('Helvetica-Bold').text('SMS ERP', { align: 'center' });
  doc.end();
} catch (e) {
  console.error("Crash:", e);
}
