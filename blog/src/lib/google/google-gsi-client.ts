'use client';

const GOOGLE_GSI_SCRIPT = 'https://accounts.google.com/gsi/client';
const STRICT_MODE_DEFER_MS = 250;
const MANUAL_PROMPT_COOLDOWN_MS = 1200;

type CredentialCallback = (credential: string) => void | Promise<void>;

const gsiRuntime = {
  scriptPromise: null as Promise<void> | null,
  initializedClientId: null as string | null,
  credentialCallback: null as CredentialCallback | null,
  autoPromptAttempted: false,
  manualPromptCooldownUntil: 0,
  promptTimerId: null as number | null,
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            context?: 'signin' | 'signup' | 'use';
            itp_support?: boolean;
            use_fedcm_for_prompt?: boolean;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export function isGoogleOneTapEnabled(): boolean {
  return process.env.NEXT_PUBLIC_GOOGLE_ONE_TAP_ENABLED === 'true';
}

export function loadGoogleGsiScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (gsiRuntime.scriptPromise) {
    return gsiRuntime.scriptPromise;
  }

  gsiRuntime.scriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${GOOGLE_GSI_SCRIPT}"]`
    );

    if (existingScript) {
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }

      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener(
        'error',
        () => reject(new Error('Google GSI script failed to load')),
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.src = GOOGLE_GSI_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google GSI script failed to load'));
    document.head.appendChild(script);
  });

  return gsiRuntime.scriptPromise;
}

function ensureGoogleIdentityInitialized(clientId: string) {
  if (!window.google?.accounts?.id) {
    throw new Error('Google Identity Services is unavailable');
  }

  if (gsiRuntime.initializedClientId === clientId) {
    return;
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => {
      void gsiRuntime.credentialCallback?.(response.credential);
    },
    auto_select: false,
    cancel_on_tap_outside: true,
    context: 'signin',
    itp_support: true,
    use_fedcm_for_prompt: false,
  });

  gsiRuntime.initializedClientId = clientId;
}

function defer(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function requestGoogleCredential(
  clientId: string,
  onCredential: CredentialCallback
): Promise<void> {
  const now = Date.now();
  if (now < gsiRuntime.manualPromptCooldownUntil) {
    return;
  }

  gsiRuntime.manualPromptCooldownUntil = now + MANUAL_PROMPT_COOLDOWN_MS;

  await loadGoogleGsiScript();
  ensureGoogleIdentityInitialized(clientId);

  const previousCallback = gsiRuntime.credentialCallback;
  gsiRuntime.credentialCallback = async (credential) => {
    try {
      await onCredential(credential);
    } finally {
      gsiRuntime.credentialCallback = previousCallback;
    }
  };

  await defer(0);
  window.google!.accounts.id.prompt();
}

export async function showGoogleOneTap(clientId: string): Promise<void> {
  if (!isGoogleOneTapEnabled() || gsiRuntime.autoPromptAttempted) {
    return;
  }

  gsiRuntime.autoPromptAttempted = true;

  await loadGoogleGsiScript();
  ensureGoogleIdentityInitialized(clientId);

  if (gsiRuntime.promptTimerId) {
    window.clearTimeout(gsiRuntime.promptTimerId);
  }

  gsiRuntime.promptTimerId = window.setTimeout(() => {
    gsiRuntime.promptTimerId = null;

    if (!window.google?.accounts?.id) {
      gsiRuntime.autoPromptAttempted = false;
      return;
    }

    window.google.accounts.id.prompt();
  }, STRICT_MODE_DEFER_MS);
}

export function setGoogleCredentialHandler(onCredential: CredentialCallback | null) {
  gsiRuntime.credentialCallback = onCredential;
}

export function resetGoogleOneTapSession() {
  gsiRuntime.autoPromptAttempted = false;
  gsiRuntime.manualPromptCooldownUntil = 0;

  if (gsiRuntime.promptTimerId) {
    window.clearTimeout(gsiRuntime.promptTimerId);
    gsiRuntime.promptTimerId = null;
  }
}
