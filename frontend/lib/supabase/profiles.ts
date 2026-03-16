import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

function toNonEmptyText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function getDisplayName(user: User, fallbackDisplayName?: string): string | null {
  return (
    toNonEmptyText(fallbackDisplayName) ??
    toNonEmptyText(user.user_metadata?.display_name) ??
    toNonEmptyText(user.user_metadata?.full_name) ??
    toNonEmptyText(user.user_metadata?.name) ??
    toNonEmptyText(user.user_metadata?.preferred_username)
  );
}

export async function syncProfileForUser(user: User, fallbackDisplayName?: string) {
  const payload: {
    id: string;
    updated_at: string;
    email?: string;
    display_name?: string;
  } = {
    id: user.id,
    updated_at: new Date().toISOString(),
  };

  const email = toNonEmptyText(user.email);
  const displayName = getDisplayName(user, fallbackDisplayName);

  if (email) {
    payload.email = email;
  }

  if (displayName) {
    payload.display_name = displayName;
  }

  const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
  return { error };
}
