import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsOfServicePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#111B21] font-sans selection:bg-[#25d366] selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#008069] text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-medium">Ketentuan Layanan</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-10 prose prose-slate max-w-none">
          <h2 className="text-2xl font-bold text-[#111b21] mb-6">Ketentuan Layanan WhatsAI</h2>
          <p className="text-sm text-gray-500 mb-8">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}</p>

          <p>Dengan mengakses atau menggunakan aplikasi WhatsAI, Anda menyetujui untuk terikat oleh Ketentuan Layanan ini.</p>

          <h3 className="text-lg font-bold mt-8 mb-4">1. Deskripsi Layanan</h3>
          <p>WhatsAI adalah antarmuka aplikasi perpesanan pihak ketiga yang memungkinkan pengguna berinteraksi dengan berbagai Model Bahasa Besar (Large Language Models) dari berbagai penyedia, memanfaatkan layanan dari jaringan OpenRouter.</p>

          <h3 className="text-lg font-bold mt-8 mb-4">2. Tanggung Jawab API Key & Biaya Penggunaan</h3>
          <p>Pengguna diwajibkan untuk menggunakan Kunci API (API Key) OpenRouter mereka sendiri untuk berinteraksi dengan model berbayar di platform kami. <strong>Anda bertanggung jawab penuh atas segala beban biaya, penagihan (billing), dan keamanan dari API Key Anda sendiri.</strong> WhatsAI tidak bertanggung jawab atas kebocoran kunci atau penyalahgunaan saldo OpenRouter Anda.</p>
          <p className="mt-2 bg-[#dcf8c7]/50 p-4 rounded-xl border border-[#dcf8c7]">
            💡 <strong>Butuh API Key?</strong> Kami juga menyediakan layanan kemudahan untuk mendapatkan API Key. Silakan kunjungi toko resmi kami di <a href="https://shop.bewhy.id" target="_blank" rel="noopener noreferrer" className="text-[#008069] font-bold hover:underline">shop.bewhy.id</a> untuk informasi lebih lanjut.
          </p>

          <h3 className="text-lg font-bold mt-8 mb-4">3. Sifat Konten AI (Halusinasi)</h3>
          <p>Layanan kami menampilkan keluaran (output) yang dihasilkan sepenuhnya oleh kecerdasan buatan pihak ketiga. AI dapat menghasilkan jawaban yang <strong>tidak akurat, tidak pantas, fiktif, atau bias (halusinasi)</strong>. WhatsAI tidak menjamin kebenaran atau kelayakan dari pesan yang dihasilkan AI. Anda sangat disarankan untuk tidak bergantung pada jawaban AI untuk membuat keputusan kritis, medis, finansial, atau legal.</p>

          <h3 className="text-lg font-bold mt-8 mb-4">4. Penggunaan Wajar & Larangan</h3>
          <p>Anda setuju untuk tidak menggunakan WhatsAI untuk:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Menghasilkan konten ilegal, pelecehan, ancaman, atau ujaran kebencian.</li>
            <li>Mencoba melakukan rekayasa balik (reverse engineering) pada aplikasi.</li>
            <li>Mendistribusikan perangkat lunak berbahaya atau melakukan spamming pada API.</li>
          </ul>

          <h3 className="text-lg font-bold mt-8 mb-4">5. Pembatasan Tanggung Jawab</h3>
          <p>Layanan WhatsAI disediakan dengan basis "sebagaimana adanya" ("as is"). Kami tidak bertanggung jawab atas kerugian langsung maupun tidak langsung yang timbul akibat penggunaan atau ketidakmampuan menggunakan layanan kami, termasuk namun tidak terbatas pada hilangnya data, waktu, atau keuntungan.</p>

        </div>
      </main>
    </div>
  );
}
