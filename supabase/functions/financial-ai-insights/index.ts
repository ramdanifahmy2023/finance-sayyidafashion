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
    const { summary, expenseData, productData, monthlyData } = await req.json();

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Format currency for Indonesian Rupiah
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(amount);
    };

    // Build comprehensive financial analysis prompt
    const analysisPrompt = `
Sebagai ahli keuangan bisnis, analisis data keuangan berikut untuk Sayyida Fashion dan berikan insight serta rekomendasi dalam bahasa Indonesia:

RINGKASAN KEUANGAN:
- Total Pendapatan: ${formatCurrency(summary.totalRevenue)}
- Total Pengeluaran: ${formatCurrency(summary.totalExpenses)}
- Total Kerugian: ${formatCurrency(summary.totalLosses)}
- Total Aset: ${formatCurrency(summary.totalAssets)}
- Total Kewajiban: ${formatCurrency(summary.totalLiabilities)}
- Laba Bersih: ${formatCurrency(summary.netProfit)}
- Kekayaan Bersih: ${formatCurrency(summary.netWorth)}

PENGELUARAN PER KATEGORI:
${expenseData.map(item => `- ${item.name}: ${formatCurrency(item.value)}`).join('\n')}

PENJUALAN PER PRODUK:
${productData.map(item => `- ${item.name}: ${item.value} unit`).join('\n')}

TREN BULANAN:
${monthlyData.map(item => `- ${item.month}: Pendapatan ${formatCurrency(item.revenue)}, Pengeluaran ${formatCurrency(item.expenses)}, Profit ${formatCurrency(item.profit)}`).join('\n')}

Berikan analisis yang mencakup:
1. **KESEHATAN KEUANGAN BISNIS**: Evaluasi kondisi keuangan saat ini
2. **ANALISIS PROFITABILITAS**: Margin keuntungan dan efisiensi
3. **TREN DAN POLA**: Identifikasi tren dari data bulanan
4. **MANAJEMEN PENGELUARAN**: Analisis kategori pengeluaran yang perlu dioptimalkan
5. **PERFORMA PRODUK**: Produk mana yang paling menguntungkan
6. **REKOMENDASI STRATEGIS**: 5-7 saran konkret untuk meningkatkan kinerja keuangan
7. **PERINGATAN & RISIKO**: Identifikasi area yang memerlukan perhatian khusus

Gunakan format yang jelas dengan bullet points dan heading yang mudah dibaca. Berikan angka spesifik dan persentase jika relevan.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Anda adalah ahli analisis keuangan bisnis yang berpengalaman dalam industri fashion dan retail. Berikan analisis yang mendalam, praktis, dan actionable dalam bahasa Indonesia yang mudah dipahami oleh pemilik bisnis.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const insights = data.choices[0].message.content;

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