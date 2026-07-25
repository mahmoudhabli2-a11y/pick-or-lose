import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { loadPlayer, savePlayer, type PlayerState } from "./quiz-data";

const GUEST_KEY = "tahaddi-guest";

export function isGuest(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(GUEST_KEY) === "1";
}

export function setGuest(v: boolean) {
  if (typeof window === "undefined") return;
  if (v) localStorage.setItem(GUEST_KEY, "1");
  else localStorage.removeItem(GUEST_KEY);
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user: session?.user ?? null, loading };
}

export async function signOut() {
  await supabase.auth.signOut();
  setGuest(false);
}

/** Load progress from cloud and merge into local player. */
export async function syncProgressFromCloud(user: User): Promise<PlayerState | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("display_name, avatar, progress")
    .eq("id", user.id)
    .maybeSingle();
  if (error || !data) return null;
  const local = loadPlayer();
  const cloud = (data.progress ?? {}) as Partial<PlayerState>;
  // Prefer whichever has more XP (avoids overwriting a further-along player).
  const merged: PlayerState =
    (cloud.xp ?? 0) >= local.xp
      ? { ...local, ...cloud, name: data.display_name, avatar: data.avatar }
      : { ...local, name: data.display_name, avatar: data.avatar };
  savePlayer(merged);
  return merged;
}

/** Push current local progress to cloud. Called after gameplay events. */
export async function pushProgressToCloud(user: User, p: PlayerState) {
  await supabase.from("profiles").upsert(
    {
      id: user.id,
      display_name: p.name,
      avatar: p.avatar,
      progress: p,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
}

/** Convenience: sync using current session if any. */
export async function maybePushProgress(p: PlayerState) {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (user) await pushProgressToCloud(user, p);
}
