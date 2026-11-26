const AUTH_ERROR_TRANSLATIONS: Array<[RegExp, string]> = [
  [/invalid login credentials/i, "Email atau kata sandi salah."],
  [/email not confirmed/i, "Email belum terverifikasi. Silakan cek kotak masuk emailmu."],
  [/user already registered/i, "Email ini sudah terdaftar. Silakan masuk dengan akunmu."],
  [/unable to validate email address|invalid format/i, "Format alamat email tidak valid."],
  [/password should be at least/i, "Kata sandi minimal 6 karakter."],
  [/signup is disabled/i, "Pendaftaran akun baru sedang dinonaktifkan."],
  [/too many requests|rate limit/i, "Terlalu banyak percobaan. Silakan tunggu beberapa saat lalu coba lagi."],
  [/failed to fetch|networkerror|fetch failed/i, "Gagal terhubung ke server autentikasi. Periksa koneksi internetmu."],
];

/**
 * Menerjemahkan pesan error autentikasi Supabase ke Bahasa Indonesia yang ramah pengguna.
 */
export function formatAuthErrorMessage(rawMessage?: string | null): string {
  const message = rawMessage?.trim();
  if (!message) {
    return "Terjadi kesalahan saat autentikasi. Silakan coba lagi.";
  }

  for (const [pattern, translated] of AUTH_ERROR_TRANSLATIONS) {
    if (pattern.test(message)) {
      return translated;
    }
  }

  return "Terjadi kendala saat autentikasi. Periksa kembali data dan koneksi internetmu.";
}
