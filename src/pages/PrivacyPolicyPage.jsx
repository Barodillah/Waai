import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#111B21] font-sans selection:bg-[#25d366] selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#008069] text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-medium">Kebijakan Privasi</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-10 prose prose-slate max-w-none">
          <h2 className="text-2xl font-bold text-[#111b21] mb-6">Kebijakan Privasi WhatsAI</h2>
          <p className="text-sm text-gray-500 mb-8">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}</p>

          <p>Selamat datang di WhatsAI. Kami menghargai privasi Anda dan berkomitmen untuk melindungi informasi pribadi yang Anda bagikan saat menggunakan layanan kami.</p>

          <h3 className="text-lg font-bold mt-8 mb-4">1. Informasi yang Kami Kumpulkan</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Data Profil:</strong> Saat Anda masuk menggunakan otentikasi Google (OAuth), kami mengumpulkan informasi dasar profil publik Anda, seperti nama, alamat email, dan foto profil.</li>
            <li><strong>Data Percakapan:</strong> Kami memproses input teks (prompt) yang Anda kirimkan melalui antarmuka kami untuk diteruskan ke model kecerdasan buatan pilihan Anda.</li>
            <li><strong>Kunci API (API Key):</strong> Kunci API pribadi Anda dari OpenRouter (jika Anda menyediakannya) disimpan secara aman di penyimpanan lokal (Local Storage) pada perangkat peramban Anda.</li>
          </ul>

          <h3 className="text-lg font-bold mt-8 mb-4">2. Bagaimana Kami Menggunakan Informasi Anda</h3>
          <p>Informasi yang kami kumpulkan semata-mata digunakan untuk menyediakan, memelihara, dan meningkatkan fungsi layanan antarmuka percakapan AI (WhatsAI) untuk Anda. Kami tidak menjual data Anda kepada pihak ketiga.</p>

          <h3 className="text-lg font-bold mt-8 mb-4">3. Keterlibatan Pihak Ketiga (Model AI)</h3>
          <p>Perlu diketahui bahwa WhatsAI beroperasi sebagai perantara antara Anda dan penyedia model AI pihak ketiga (melalui jaringan OpenRouter). Setiap pesan yang Anda kirimkan dalam sesi obrolan akan diteruskan melalui API ke penyedia model terkait (seperti OpenAI, Anthropic, Meta, dll.). Kami menyarankan Anda untuk <strong>tidak membagikan informasi sensitif, rahasia, atau data pribadi yang kritikal</strong> ke dalam obrolan.</p>

          <h3 className="text-lg font-bold mt-8 mb-4">4. End-to-End Encryption</h3>
          <p>Percakapan Anda dilindungi oleh End-to-End Encryption (Enkripsi Ujung-ke-Ujung). Pesan dan data percakapan Anda sangat rahasia; kami sama sekali tidak dapat membaca, memantau, menganalisis, atau menggunakan riwayat obrolan Anda untuk keperluan apa pun termasuk pelatihan model AI.</p>

          <h3 className="text-lg font-bold mt-8 mb-4">5. Perubahan pada Kebijakan</h3>
          <p>Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu. Kami menganjurkan Anda untuk meninjau halaman ini secara berkala untuk mengetahui perubahan apa pun.</p>

        </div>
      </main>
    </div>
  );
}
