// src/utils/reportPdfExport.ts

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportData } from '@/hooks/useFinancialReport';
import { Sale } from '@/types/sales';
import { Expense } from '@/types/expense';
import { Loss } from '@/types/loss';
import { formatCurrency } from './currencyFormatter';

interface UserCompanyProfile {
  companyName: string;
  businessType: string;
  phone: string;
  email: string;
  address: string;
}

const FONT_FAMILY = 'helvetica';
const FONT_STYLE_NORMAL = 'normal';
const FONT_STYLE_BOLD = 'bold';
const FONT_COLOR_NORMAL = '#333333';
const FONT_COLOR_MUTED = '#666666';
const COLOR_PRIMARY = '#DB2777';

const addHeader = (doc: jsPDF, profile: UserCompanyProfile, period: string) => {
  doc.setFont(FONT_FAMILY, FONT_STYLE_BOLD);
  doc.setFontSize(22);
  doc.setTextColor(COLOR_PRIMARY);
  doc.text(profile.companyName || 'Laporan Keuangan', 20, 30);

  doc.setFont(FONT_FAMILY, FONT_STYLE_NORMAL);
  doc.setFontSize(12);
  doc.setTextColor(FONT_COLOR_MUTED);
  doc.text(profile.businessType || 'Laporan Keuangan', 20, 38);
  doc.text(`Periode: ${period}`, 20, 46);

  doc.line(20, 55, doc.internal.pageSize.width - 20, 55);
};

const addSummary = (doc: jsPDF, data: ReportData, sales: Sale[]) => {
  doc.setFont(FONT_FAMILY, FONT_STYLE_BOLD);
  doc.setFontSize(16);
  doc.setTextColor(COLOR_PRIMARY);
  doc.text('Ringkasan Finansial', 20, 70);

  const summaryData = [
    ['Omset (Pendapatan Kotor)', formatCurrency(data.omset)],
    ['Total Transaksi Masuk', `${sales.length} transaksi`],
    ['Modal (HPP)', formatCurrency(data.modal)],
    ['Pengeluaran', formatCurrency(data.pengeluaran)],
    ['Kerugian', formatCurrency(data.kerugian)],
    ['Laba Bersih (Sebelum Infaq)', formatCurrency(data.profitSebelumInfaq)],
    ['Infaq (2.5%)', formatCurrency(data.infaq)],
    ['Profit Bersih (Setelah Infaq)', formatCurrency(data.profitBersih)],
  ];

  autoTable(doc, {
    startY: 80,
    head: [['Deskripsi', 'Jumlah']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [219, 39, 119], font: FONT_FAMILY, fontStyle: FONT_STYLE_BOLD },
    styles: { font: FONT_FAMILY, fontStyle: FONT_STYLE_NORMAL, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: FONT_STYLE_BOLD, textColor: FONT_COLOR_NORMAL },
      1: { halign: 'right' }
    },
    didDrawPage: (data: any) => {
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(10);
      doc.setTextColor(FONT_COLOR_MUTED);
      doc.text(
        `Halaman ${data.pageNumber} dari ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
  });

  return (doc as any).lastAutoTable.finalY + 15;
};

const addDetailsTable = (doc: jsPDF, title: string, headers: string[], data: any[][], startY: number) => {
  doc.setFont(FONT_FAMILY, FONT_STYLE_BOLD);
  doc.setFontSize(16);
  doc.setTextColor(COLOR_PRIMARY);
  doc.text(title, 20, startY);

  autoTable(doc, {
    startY: startY + 10,
    head: [headers],
    body: data,
    theme: 'grid',
    headStyles: { fillColor: [219, 39, 119], font: FONT_FAMILY, fontStyle: FONT_STYLE_BOLD },
    styles: { font: FONT_FAMILY, fontStyle: FONT_STYLE_NORMAL, fontSize: 9, cellPadding: 2 },
    columnStyles: {
      2: { halign: 'right' }
    }
  });

  return (doc as any).lastAutoTable.finalY + 15;
};

export const exportFinancialReportToPDF = (
  reportData: ReportData,
  sales: Sale[],
  expenses: Expense[],
  losses: Loss[],
  selectedDate: Date
) => {
  const doc = new jsPDF();
  let finalY = 0;

  const savedProfile = localStorage.getItem('companyProfile');
  const profile: UserCompanyProfile = savedProfile ? JSON.parse(savedProfile) : {
    companyName: 'Sayyida Fashion',
    businessType: 'Fashion/Clothing',
    phone: '',
    email: '',
    address: ''
  };

  const period = `${selectedDate.toLocaleString('id-ID', { month: 'long' })} ${selectedDate.getFullYear()}`;

  addHeader(doc, profile, period);
  finalY = addSummary(doc, reportData, sales);

  const expenseDetails = expenses.map(e => [
    new Date(e.transaction_date).toLocaleDateString('id-ID'),
    e.category,
    formatCurrency(e.amount),
    e.description || '-'
  ]);
  finalY = addDetailsTable(doc, 'Rincian Pengeluaran', ['Tanggal', 'Kategori', 'Jumlah', 'Deskripsi'], expenseDetails, finalY);

  const lossDetails = losses.map(l => [
    new Date(l.transaction_date).toLocaleDateString('id-ID'),
    l.loss_type,
    formatCurrency(l.amount),
    l.description || '-'
  ]);
  addDetailsTable(doc, 'Rincian Kerugian', ['Tanggal', 'Tipe', 'Jumlah', 'Deskripsi'], lossDetails, finalY);

  const fileName = `Laporan_Keuangan_${period.replace(' ', '_')}.pdf`;
  doc.save(fileName);
};
