"use client";

import { useState } from "react";
import { GoogleLogo } from "@phosphor-icons/react";
import { Alert, Button } from "@heroui/react";
import { createClient } from "../../lib/supabase/client";

type OAuthButtonsProps = {
  next?: string;
};

export default function OAuthButtons({
  next = "/user/dashboard",
}: OAuthButtonsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithGoogle() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const safeNext =
      next.startsWith("/") && !next.startsWith("//") ? next : "/user/dashboard";
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {error ? (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Content>
        </Alert>
      ) : null}

      <Button
        type="button"
        fullWidth
        variant="secondary"
        isDisabled={loading}
        onPress={signInWithGoogle}
        className="transition-transform active:scale-[0.98]"
      >
        <GoogleLogo className="size-4 shrink-0" aria-hidden />
        {loading ? "Redirecting…" : "Continue with Google"}
      </Button>
    </div>
  );
}
