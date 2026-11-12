import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Halaman yang hanya boleh dibuka setelah login.
const HALAMAN_TERLINDUNGI = ["/dashboard", "/keluarga", "/pindai", "/riwayat", "/bu-nita"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser memeriksa token ke server Supabase. Jangan memakai getSession untuk keputusan akses.
  const { data: { user } } = await supabase.auth.getUser();

  const perluLogin = HALAMAN_TERLINDUNGI.some((p) =>
    request.nextUrl.pathname.startsWith(p),
  );

  if (!user && perluLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/masuk";
    return NextResponse.redirect(url);
  }

  return response;
}
