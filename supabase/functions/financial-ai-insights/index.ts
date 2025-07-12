import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      summary, 
      expenseData, 
      productData, 
      monthlyData,
      detailedSales,
      detailedExpenses,
      detailedLosses,
      customerAnalysis,
      periodComparison,
      businessKPIs
    } = await req.json();

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Format currency for Indonesian Rupiah
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(amount);
    };

    // Build comprehensive financial analysis prompt with enhanced data
    const analysisPrompt = `
Sebagai ahli analisis keuangan bisnis yang berpengalaman dalam industri fashion dan retail Indonesia, analisis data keuangan berikut untuk Sayyida Fashion dan berikan insight mendalam serta rekomendasi strategis dalam bahasa Indonesia:

# RINGKASAN KEUANGAN UTAMA:
- Total Pendapatan: ${formatCurrency(summary.totalRevenue)}
- Total Modal: ${formatCurrency(summary.totalCapital || 0)}
- Total Pengeluaran: ${formatCurrency(summary.totalExpenses)}
- Total Kerugian: ${formatCurrency(summary.totalLosses)}
- Gross Margin: ${formatCurrency(summary.grossMargin || 0)}
- Laba Bersih: ${formatCurrency(summary.netProfit)}
- Total Transaksi: ${summary.totalTransactions || 0}
- Fee Marketplace: ${formatCurrency(summary.marketplaceFees || 0)}

# KPI BISNIS FASHION:
${businessKPIs ? `
- Average Order Value (AOV): ${formatCurrency(businessKPIs.averageOrderValue)}
- Gross Margin %: ${businessKPIs.grossMarginPercent?.toFixed(2)}%
- Net Profit Margin %: ${businessKPIs.netProfitMargin?.toFixed(2)}%
- Marketplace Fee Ratio: ${businessKPIs.marketplaceFeeRatio?.toFixed(2)}%
- Revenue per Transaction: ${formatCurrency(businessKPIs.revenuePerTransaction)}
- Monthly Growth Rate: ${businessKPIs.monthlyGrowthRate?.toFixed(2)}%
` : ''}

# ANALISIS PERIODE PERBANDINGAN:
${periodComparison ? `
## Pertumbuhan Bulanan:
- Revenue Growth: ${periodComparison.revenueGrowth?.toFixed(2)}%
- Expense Growth: ${periodComparison.expenseGrowth?.toFixed(2)}%
- Profit Growth: ${periodComparison.profitGrowth?.toFixed(2)}%
- Transaction Growth: ${periodComparison.transactionGrowth?.toFixed(2)}%

## Perbandingan vs Bulan Lalu:
- Revenue: ${formatCurrency(periodComparison.currentRevenue)} vs ${formatCurrency(periodComparison.previousRevenue)}
- Expenses: ${formatCurrency(periodComparison.currentExpenses)} vs ${formatCurrency(periodComparison.previousExpenses)}
- Profit: ${formatCurrency(periodComparison.currentProfit)} vs ${formatCurrency(periodComparison.previousProfit)}
` : ''}

# DETAIL TRANSAKSI PENJUALAN:
${detailedSales?.slice(0, 20).map(sale => 
  `- ${sale.product_type}: ${formatCurrency(sale.selling_price)} (Modal: ${formatCurrency(sale.purchase_price)}, Margin: ${formatCurrency(sale.selling_price - sale.purchase_price)}) - ${sale.customer_name} via ${sale.payment_method}`
).join('\n') || 'Data detail tidak tersedia'}

# ANALISIS PELANGGAN:
${customerAnalysis ? `
- Total Unique Customers: ${customerAnalysis.totalCustomers}
- Repeat Customers: ${customerAnalysis.repeatCustomers}
- Average Revenue per Customer: ${formatCurrency(customerAnalysis.avgRevenuePerCustomer)}
- Top Customer Spending: ${formatCurrency(customerAnalysis.topCustomerSpending)}
- Customer Retention Rate: ${customerAnalysis.retentionRate?.toFixed(2)}%

## Top 5 Customers:
${customerAnalysis.topCustomers?.map(customer => 
  `- ${customer.name}: ${customer.totalPurchases} transaksi, ${formatCurrency(customer.totalSpent)}`
).join('\n') || ''}
` : ''}

# BREAKDOWN PENGELUARAN DETAIL:
${expenseData.map(item => `- ${item.name}: ${formatCurrency(item.value)}`).join('\n')}

# DETAIL PENGELUARAN TERBESAR:
${detailedExpenses?.slice(0, 10).map(expense => 
  `- ${expense.category}: ${formatCurrency(expense.amount)} - ${expense.description || 'No description'} (${new Date(expense.transaction_date).toLocaleDateString('id-ID')})`
).join('\n') || 'Data detail tidak tersedia'}

# PERFORMA PRODUK & KATEGORI:
${productData.map(item => `- ${item.name}: ${item.value} unit terjual`).join('\n')}

# ANALISIS KERUGIAN:
${detailedLosses?.slice(0, 10).map(loss => 
  `- ${loss.loss_type}: ${formatCurrency(loss.amount)} - ${loss.description} (${new Date(loss.transaction_date).toLocaleDateString('id-ID')})`
).join('\n') || 'Tidak ada kerugian dalam periode ini'}

# TREN BULANAN KOMPREHENSIF:
${monthlyData.map(item => `- ${item.month}: Revenue ${formatCurrency(item.revenue)}, Expenses ${formatCurrency(item.expenses)}, Profit ${formatCurrency(item.profit)} (Margin: ${item.revenue > 0 ? ((item.profit / item.revenue) * 100).toFixed(2) : 0}%)`).join('\n')}

# KONTEKS INDUSTRI FASHION INDONESIA:
- Musim: ${new Date().getMonth() >= 5 && new Date().getMonth() <= 7 ? 'Periode Ramadan & Lebaran (High Season)' : new Date().getMonth() >= 10 || new Date().getMonth() <= 1 ? 'Periode Akhir Tahun (Holiday Season)' : 'Regular Season'}
- Target Market: Fashion Muslim Indonesia
- Kompetisi: E-commerce fashion lokal dan brand internasional
- Payment Methods: Dominasi digital payment dan marketplace

BERIKAN ANALISIS MENDALAM YANG MENCAKUP:

## 1. 🏥 DIAGNOSA KESEHATAN BISNIS
- Analisis cash flow dan likuiditas
- Debt-to-equity ratio assessment
- Profitability sustainability analysis

## 2. 📊 ANALISIS PROFITABILITAS ADVANCED
- Gross margin analysis per produk
- Customer acquisition cost vs lifetime value
- Channel profitability (marketplace vs direct)
- Unit economics breakdown

## 3. 📈 TREN & PATTERN RECOGNITION
- Seasonal patterns dalam fashion
- Customer behavior patterns
- Product lifecycle analysis
- Market demand forecasting

## 4. 💰 OPTIMISASI PENGELUARAN STRATEGIS
- Cost center prioritization
- ROI analysis per kategori pengeluaran
- Efficiency improvement opportunities
- Budget reallocation recommendations

## 5. 🎯 ANALISIS PERFORMA PRODUK & PORTFOLIO
- Best performing vs underperforming products
- Inventory turnover analysis
- Cross-selling opportunities
- Product mix optimization

## 6. 👥 CUSTOMER INTELLIGENCE & SEGMENTATION
- Customer lifetime value analysis
- Retention vs acquisition strategies
- Price sensitivity analysis
- Market segment opportunities

## 7. 🚀 REKOMENDASI STRATEGIS ACTIONABLE
- 7-10 specific action items dengan timeline
- ROI projections untuk setiap rekomendasi
- Resource requirements dan implementation plan
- Risk mitigation strategies

## 8. ⚠️ RISK ASSESSMENT & EARLY WARNING INDICATORS
- Cash flow risks
- Market competition threats
- Operational efficiency gaps
- Financial red flags

## 9. 🔮 PREDIKSI & FORECASTING
- Revenue projections 3-6 bulan ke depan
- Seasonal adjustment recommendations
- Growth scenario modeling
- Market opportunity sizing

## 10. 📋 ACTION PLAN PRIORITAS
- Quick wins (0-30 hari)
- Medium term initiatives (1-3 bulan)
- Long term strategic moves (3-12 bulan)

Gunakan data spesifik, berikan persentase yang akurat, dan pastikan semua rekomendasi actionable dengan clear metrics untuk tracking success. Fokus pada insights yang bisa diimplementasikan langsung oleh pemilik bisnis fashion Indonesia.
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Anda adalah ahli analisis keuangan bisnis yang berpengalaman dalam industri fashion dan retail. Berikan analisis yang mendalam, praktis, dan actionable dalam bahasa Indonesia yang mudah dipahami oleh pemilik bisnis.\n\n${analysisPrompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const insights = data.candidates[0].content.parts[0].text;

    console.log('AI insights generated successfully');

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in financial-ai-insights function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate AI insights',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});