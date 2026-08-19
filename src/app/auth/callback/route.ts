import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

function resolveRedirectPath(
  isAdmin: boolean,
  next: string,
  hasExplicitNext: boolean
): string {
  if (isAdmin) return "/admin";
  if (hasExplicitNext) return next;
  return "/user/dashboard";
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");
  let next = nextParam ?? "/user/dashboard";
  const hasExplicitNext = Boolean(nextParam);

  if (!next.startsWith("/") || next.startsWith("//")) {
    next = "/user/dashboard";
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin = profile?.is_admin ?? false;
  }

  const redirectPath = resolveRedirectPath(isAdmin, next, hasExplicitNext);
  revalidatePath("/", "layout");

  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";

  if (isLocalEnv) {
    return NextResponse.redirect(`${origin}${redirectPath}`);
  }

  if (forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`);
  }

  return NextResponse.redirect(`${origin}${redirectPath}`);
}
