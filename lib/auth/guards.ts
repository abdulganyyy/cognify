import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AppError } from "@/lib/utils/errors";

export async function requireApiUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AppError("Sesi tidak valid. Silakan masuk kembali.", 401, "UNAUTHORIZED");
  }

  await ensureUserProfile(user);

  return { supabase, user };
}

/**
 * Menjamin baris profil user ada di public.profiles meskipun trigger auth belum dijalankan.
 */
export async function ensureUserProfile(user: User) {
  const admin = createAdminClient();
  const fullName =
    (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()) ||
    (typeof user.user_metadata?.name === "string" && user.user_metadata.name.trim()) ||
    user.email?.split("@")[0] ||
    "Pengguna";

  const avatarUrl =
    typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null;

  await admin.from("profiles").upsert(
    {
      id: user.id,
      full_name: fullName,
      avatar_url: avatarUrl,
      preferred_language: "id",
    },
    { onConflict: "id", ignoreDuplicates: true }
  );
}
