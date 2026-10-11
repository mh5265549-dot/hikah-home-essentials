import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OAuthDetails = Record<string, any>;

type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: OAuthDetails | null; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: OAuthDetails | null; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: OAuthDetails | null; error: { message: string } | null }>;
};

const oauth = () => (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

const OAuthConsent = () => {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<OAuthDetails | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?next=" + encodeURIComponent(next);
        return;
      }
      setAccount(sess.session.user.email ?? null);
      const { data, error: err } = await oauth().getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (err) {
        setError(err.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  const decide = async (approve: boolean) => {
    setBusy(true);
    const { data, error: err } = approve
      ? await oauth().approveAuthorization(authorizationId)
      : await oauth().denyAuthorization(authorizationId);
    if (err) {
      setBusy(false);
      setError(err.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  };

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 text-center">
        <div className="max-w-sm space-y-2">
          <h1 className="text-lg font-bold text-foreground">Could not load this request</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </main>
    );
  }

  if (!details) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  const clientName = details.client?.name ?? "an app";

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card rounded-2xl p-6 card-shadow space-y-5">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">
            Connect {clientName} to HIKMAH
          </h1>
          <p className="text-sm text-muted-foreground">
            This lets {clientName} use this app as you.
          </p>
        </div>

        <div className="rounded-xl bg-muted p-4 text-sm space-y-2">
          {account && (
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Signed in as</span>
              <span className="font-medium text-foreground break-all">{account}</span>
            </div>
          )}
          {details.client?.redirect_uri && (
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Redirects to</span>
              <span className="font-medium text-foreground break-all">{details.client.redirect_uri}</span>
            </div>
          )}
          {details.scope && (
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Requested</span>
              <span className="font-medium text-foreground break-all">{details.scope}</span>
            </div>
          )}
        </div>

        <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
          <li>Browse the shop catalogue and prices</li>
          <li>Place grocery orders on your behalf</li>
          <li>Read the orders you placed</li>
        </ul>

        <p className="text-xs text-muted-foreground">
          This does not bypass this app's permissions or backend policies.
        </p>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 rounded-full" disabled={busy} onClick={() => decide(false)}>
            Cancel connection
          </Button>
          <Button className="flex-1 rounded-full" disabled={busy} onClick={() => decide(true)}>
            {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Approve
          </Button>
        </div>
      </div>
    </main>
  );
};

export default OAuthConsent;