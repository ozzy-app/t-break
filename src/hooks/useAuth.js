import { useEffect, useRef, useState } from 'react';
import { sb } from '../lib/supabase';
import { registerSession } from '../lib/state';

export function useAuth() {
  const [me, setMe] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const authCheckedRef = useRef(false);
  const markChecked = () => {
    if (authCheckedRef.current) return;
    authCheckedRef.current = true;
    setAuthChecked(true);
  };

  // Resolve the current session → profile → me, or give up
  const applySession = async (session) => {
    if (!session?.user) return false;
    try {
      const { data: profile, error } = await sb
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (error || !profile) {
        console.warn('No profile for user', session.user.id, error?.message);
        return false;
      }
      if (!profile.approved) {
        console.warn('Profile not approved');
        return false;
      }
      const meData = {
        userId: session.user.id,
        name: profile.name,
        isLeader: profile.is_leader,
        team: profile.team || null,
        email: session.user.email,
      };
      setMe(meData);
      // fire-and-forget — don't block auth on this
      registerSession(meData).catch(() => {});
      return true;
    } catch (e) {
      console.error('applySession', e);
      return false;
    }
  };

  useEffect(() => {
    // Hard cap: no matter what, after 6s we stop "Laden…"
    const hardTimeout = setTimeout(markChecked, 6000);

    (async () => {
      try {
        const { data, error } = await sb.auth.getSession();
        if (error) {
          console.warn('getSession error, clearing stale session', error.message);
          await sb.auth.signOut(); // wipe bad token from storage
          markChecked();
          return;
        }
        if (data?.session) {
          const ok = await applySession(data.session);
          if (!ok) {
            // Session exists but profile missing/unapproved — sign out cleanly
            await sb.auth.signOut();
          }
        }
        // URL hash token (email confirmation) — let onAuthStateChange handle it
      } catch (e) {
        console.error('restore error', e);
        try { await sb.auth.signOut(); } catch {}
      } finally {
        clearTimeout(hardTimeout);
        markChecked();
      }
    })();

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setMe(null);
        markChecked();
        return;
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        await applySession(session);
        if (window.location.hash.includes('access_token')) {
          window.history.replaceState(null, '', window.location.pathname);
        }
        markChecked();
      }
    });

    return () => {
      clearTimeout(hardTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try { await sb.auth.signOut(); } catch {}
    setMe(null);
  };

  const toggleLeader = () => setMe((p) => ({ ...p, isLeader: !p.isLeader }));

  return { me, setMe, authChecked, signOut, toggleLeader };
}
