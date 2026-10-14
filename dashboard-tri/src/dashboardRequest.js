// The RPC has a 60s SQL budget; allow a small margin for network/JSON transfer.
export const DASHBOARD_TIMEOUT_MS = 65_000;

export async function requestDashboard(url, anonKey, token) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DASHBOARD_TIMEOUT_MS);
  try {
    const res = await fetch(`${url}/rest/v1/rpc/get_partner_dashboard`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_token: token }),
      signal: controller.signal,
    });
    let data;
    try {
      data = await res.json();
    } catch (err) {
      if (controller.signal.aborted) throw err;
      throw new Error("Réponse du serveur invalide. Veuillez réessayer.");
    }
    if (!res.ok) {
      if (data?.code === "57014" || res.status === 504 || res.status === 408) {
        throw new Error("Le chargement du tableau de bord a dépassé le délai autorisé. Veuillez réessayer.");
      }
      if (data?.code === "42501" || res.status === 401 || res.status === 403) {
        throw new Error("Code d'accès incorrect ou accès refusé.");
      }
      throw new Error("Impossible de charger le tableau de bord. Veuillez réessayer.");
    }
    if (!data || typeof data !== "object" || Array.isArray(data) || !data.profil) {
      throw new Error("Réponse du serveur invalide. Veuillez réessayer.");
    }
    return data;
  } catch (err) {
    if (controller.signal.aborted) {
      throw new Error("Le serveur n'a pas répondu sous 65 secondes. Veuillez réessayer.");
    }
    if (err instanceof TypeError) {
      throw new Error("Connexion au serveur impossible. Vérifiez votre connexion et réessayez.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
