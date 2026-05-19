// middleware.ts (project root — same level as app/)
import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

/**
 * When the Supabase client refreshes the session, it writes Set-Cookie on `from`.
 * Plain `NextResponse.redirect()` / `json()` responses drop those cookies unless
 * we copy them — otherwise the browser keeps stale tokens and refresh fails with
 * "Invalid Refresh Token: Refresh Token Not Found".
 */
function copySupabaseAuthCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value }) => {
    to.cookies.set(name, value)
  })
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  request.headers.set("x-pathname", pathname)

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not use getSession() — it reads from storage only
  // getUser() actually verifies the JWT with Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser()

  function redirectWithCookies(url: URL) {
    const res = NextResponse.redirect(url)
    copySupabaseAuthCookies(supabaseResponse, res)
    return res
  }

  // ── Portal Routes (/portal/*) ──────────────────────────────

  if (pathname.startsWith("/portal")) {
    // Portal login page
    if (pathname === "/portal/login") {
      if (user) {
        // Authenticated portal user → redirect to portal dashboard
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        if (profile?.role === "customer") {
          const url = request.nextUrl.clone()
          url.pathname = "/portal"
          return redirectWithCookies(url)
        }
        // Staff user on portal login → send to dashboard
        const url = request.nextUrl.clone()
        url.pathname = "/dashboard"
        return redirectWithCookies(url)
      }
      return supabaseResponse
    }

    // All other portal routes require auth
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/portal/login"
      return redirectWithCookies(url)
    }

    // Verify the user is a customer (or admin previewing portal)
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role, password_set")
      .eq("id", user.id)
      .single()

    if (profile?.role === "customer") {
      // If customer hasn't set a password yet, redirect to set-password
      // (except if they're already on the set-password page)
      if (!profile.password_set && pathname !== "/portal/set-password") {
        const url = request.nextUrl.clone()
        url.pathname = "/portal/set-password"
        return redirectWithCookies(url)
      }
      return supabaseResponse
    }

    if (profile?.role === "admin" || profile?.role === "dispatcher") {
      // Staff can preview portal for testing
      return supabaseResponse
    }

    // Unknown role → redirect to dashboard
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return redirectWithCookies(url)
  }

  // ── Auth Callback (/auth/callback) ─────────────────────────
  if (pathname.startsWith("/auth/callback")) {
    return supabaseResponse
  }

  // ── Staff Set-Password (/set-password) ───────────────────
  if (pathname === "/set-password") {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      return redirectWithCookies(url)
    }
    // Allow authenticated users to access set-password page
    return supabaseResponse
  }

  // ── Dashboard Routes (/dashboard/*) ────────────────────────

  // Unauthenticated user trying to access dashboard → redirect to login
  if (!user && pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return redirectWithCookies(url)
  }

  // Unauthenticated user trying to access API → return 401
  if (!user && pathname.startsWith("/api/")) {
    const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    copySupabaseAuthCookies(supabaseResponse, res)
    return res
  }

  // Authenticated user on login page → redirect to dashboard
  if (user && pathname === "/login") {
    // But first check if they need MFA verification
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (aal && aal.nextLevel === "aal2" && aal.currentLevel === "aal1") {
      // They have MFA enrolled but haven't verified — let them stay on login
      return supabaseResponse
    }

    // Check if this is a customer user — redirect to portal instead
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role === "customer") {
      const url = request.nextUrl.clone()
      url.pathname = "/portal"
      return redirectWithCookies(url)
    }

    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return redirectWithCookies(url)
  }

  // Allow MFA enrollment page for authenticated users
  if (pathname.startsWith("/mfa")) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      return redirectWithCookies(url)
    }
    return supabaseResponse
  }

  // For dashboard routes: enforce role, password_set, and MFA
  if (user && pathname.startsWith("/dashboard")) {
    // Block customer users from accessing dashboard
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role, password_set")
      .eq("id", user.id)
      .single()

    if (profile?.role === "customer") {
      const url = request.nextUrl.clone()
      url.pathname = "/portal"
      return redirectWithCookies(url)
    }

    // Staff user who hasn't set a password yet → redirect to set-password
    if (profile && !profile.password_set) {
      const url = request.nextUrl.clone()
      url.pathname = "/set-password"
      return redirectWithCookies(url)
    }

    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (aal && aal.nextLevel === "aal2" && aal.currentLevel === "aal1") {
      // User has MFA but only completed aal1 — send back to login for MFA step
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      return redirectWithCookies(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/api/:path*",
    "/mfa/:path*",
    "/portal/:path*",
    "/auth/:path*",
    "/set-password",
  ],
}
