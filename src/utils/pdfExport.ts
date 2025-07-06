
import jsPDF from 'jspdf';

interface DashboardMetrics {
  totalRevenue: number;
  totalCapital: number;
  totalExpenses: number;
  totalLosses: number;
  grossMargin: number;
  netProfit: number;
  totalTransactions: number;
  marketplaceFees: number;
}

export const exportDashboardToPDF = (metrics: DashboardMetrics, selectedDate: Date) => {
  const doc = new jsPDF();
  
  // Set up fonts and colors
  doc.setFontSize(20);
  doc.setTextColor(219, 39, 119); // Pink color for header
  
  // Company header
  doc.text('Sayyida Fashion', 20, 30);
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Pelacakan Keuangan', 20, 40);
  
  // Date and period info
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const periodText = `Periode: ${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
  doc.text(periodText, 20, 55);
  
  // Add a line separator
  doc.setLineWidth(0.5);
  doc.line(20, 65, 190, 65);
  
  // Financial metrics section
  doc.setFontSize(16);
  doc.setTextColor(219, 39, 119);
  doc.text('Ringkasan Keuangan', 20, 80);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  
  let yPosition = 100;
  const lineHeight = 15;
  
  // Metrics data
  const metricsData = [
    ['Total Pendapatan', formatCurrency(metrics.totalRevenue)],
    ['Total Modal', formatCurrency(metrics.totalCapital)],
    ['Total Pengeluaran', formatCurrency(metrics.totalExpenses)],
    ['Total Kerugian', formatCurrency(metrics.totalLosses)],
    ['Margin Kotor', formatCurrency(metrics.grossMargin)],
    ['Laba Bersih', formatCurrency(metrics.netProfit)],
    ['Total Transaksi', metrics.totalTransactions.toString()],
    ['Biaya Marketplace', formatCurrency(metrics.marketplaceFees)]
  ];
  
  // Draw metrics table
  metricsData.forEach(([label, value]) => {
    doc.text(label + ':', 25, yPosition);
    doc.text(value, 120, yPosition);
    yPosition += lineHeight;
  });
  
  // Add summary section
  yPosition += 10;
  doc.setFontSize(16);
  doc.setTextColor(219, 39, 119);
  doc.text('Analisis', 20, yPosition);
  
  yPosition += 20;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  
  const profitMargin = metrics.totalRevenue > 0 ? 
    ((metrics.netProfit / metrics.totalRevenue) * 100).toFixed(1) : '0.0';
  
  const analysisText = [
    `Margin Keuntungan: ${profitMargin}%`,
    `Status: ${metrics.netProfit >= 0 ? 'Profitable' : 'Rugi'}`,
    `Rata-rata per Transaksi: ${formatCurrency(metrics.totalTransactions > 0 ? metrics.totalRevenue / metrics.totalTransactions : 0)}`
  ];
  
  analysisText.forEach(text => {
    doc.text(text, 25, yPosition);
    yPosition += lineHeight;
  });
  
  // Add footer
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(`Digenerate pada: ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')}`, 20, 280);
  
  // Save the PDF
  const fileName = `Sayyida_Fashion_Dashboard_${monthNames[selectedDate.getMonth()]}_${selectedDate.getFullYear()}.pdf`;
  doc.save(fileName);
};
