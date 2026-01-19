import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          if (typeof document === "undefined") return undefined;
          const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
          return match ? decodeURIComponent(match[2]) : undefined;
        },
        set(name, value, options) {
          if (typeof document === "undefined") return;
          let cookie = `${name}=${encodeURIComponent(value)}`;
          if (options?.maxAge) cookie += `; Max-Age=${options.maxAge}`;
          if (options?.path) cookie += `; Path=${options.path}`;
          else cookie += "; Path=/";
          if (options?.domain) cookie += `; Domain=${options.domain}`;
          if (options?.sameSite) cookie += `; SameSite=${options.sameSite}`;
          else cookie += "; SameSite=Lax";
          if (options?.secure) cookie += "; Secure";
          else if (location.protocol === "https:") cookie += "; Secure";
          document.cookie = cookie;
        },
        remove(name, options) {
          if (typeof document === "undefined") return;
          document.cookie = `${name}=; Max-Age=0; Path=${options?.path || "/"}`;
        },
      },
    }
  );
}
