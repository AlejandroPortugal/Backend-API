import { jsPDF } from "jspdf";
import xlsx from "xlsx";
import htmlToDocx from "html-docx-js";
import * as documentUsecase from "./document.usecase.js";

export const exportExcel = async (_req, res) => {
  try {
    const result = await documentUsecase.getEntrevistas();
    const data = result.data;

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Entrevistas");

    const excelBuffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Disposition", "attachment; filename=entrevistas.xlsx");
    res.send(excelBuffer);
  } catch (error) {
    console.error("Error al exportar a Excel:", error?.message || error);
    res.status(500).json({ error: "Error al exportar a Excel" });
  }
};

export const exportToPDF = async (_req, res) => {
  try {
    const result = await documentUsecase.getEntrevistas();
    const data = result.data;

    const doc = new jsPDF();
    doc.text("Listado de Entrevistas", 14, 10);

    let y = 20;
    data.forEach((item, index) => {
      const line = `${index + 1}. ${item.nombres ?? ""} ${item.apellidopaterno ?? ""} ${
        item.apellidomaterno ?? ""
      } - ${item.email ?? ""}`;
      doc.text(line.trim(), 14, y);
      y += 8;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });

    const pdfBuffer = doc.output("arraybuffer");
    res.setHeader("Content-Disposition", "attachment; filename=entrevistas.pdf");
    res.contentType("application/pdf");
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error("Error al exportar a PDF:", error?.message || error);
    res.status(500).json({ error: "Error al exportar a PDF" });
  }
};

export const exportWord = async (_req, res) => {
  try {
    const result = await documentUsecase.getEntrevistas();
    const data = result.data;

    let htmlContent = "<h1>Listado de Entrevistas</h1>";
    data.forEach((item) => {
      htmlContent += `<p>Nombre: ${item.nombres}, Estado: ${item.estado}</p>`;
    });

    const docxBuffer = htmlToDocx.asBlob(htmlContent);
    res.setHeader("Content-Disposition", "attachment; filename=entrevistas.docx");
    res.send(docxBuffer);
  } catch (error) {
    console.error("Error al exportar a Word:", error?.message || error);
    res.status(500).json({ error: "Error al exportar a Word" });
  }
};
