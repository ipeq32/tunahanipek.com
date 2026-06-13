'use client';

const GOOGLE_GSI_SCRIPT = 'https://accounts.google.com/gsi/client';
const STRICT_MODE_DEFER_MS = 250;
const MANUAL_PROMPT_COOLDOWN_MS = 1200;

type CredentialCallback = (credential: string) => void | Promise<void>;

type PromptMomentNotification = {
  isDisplayMoment: () => boolean;
  isDisplayed: () => boolean;
  isNotDisplayed: () => boolean;
  getNotDisplayedReason: () => string;
  isSkippedMoment: () => boolean;
  getSkippedReason: () => string;
  isDismissedMoment: () => boolean;
  getDismissedReason: () => string;
  getMomentType: () => string;
};

export type GoogleCredentialRequestResult = 'credential' | 'dismissed' | 'cooldown';

const gsiRuntime = {
  scriptPromise: null as Promise<void> | null,
  initializedClientId: null as string | null,
  credentialCallback: null as CredentialCallback | null,
  autoPromptAttempted: false,
  manualPromptCooldownUntil: 0,
  promptTimerId: null as number | null,
  renderButtonContainers: new WeakSet<HTMLElement>(),
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
          prompt: (momentListener?: (notification: PromptMomentNotification) => void) => void;
          cancel: () => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              width?: number | string;
              logo_alignment?: 'left' | 'center';
            }
          ) => void;
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
    use_fedcm_for_prompt: true,
  });

  gsiRuntime.initializedClientId = clientId;
}

function defer(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function restoreCredentialCallback(previous: CredentialCallback | null) {
  gsiRuntime.credentialCallback = previous;
}

export async function mountGoogleRenderButton(
  container: HTMLElement,
  clientId: string
): Promise<void> {
  await loadGoogleGsiScript();
  ensureGoogleIdentityInitialized(clientId);

  if (gsiRuntime.renderButtonContainers.has(container)) {
    return;
  }

  const width =
    container.offsetWidth || container.parentElement?.offsetWidth || 320;

  window.google!.accounts.id.renderButton(container, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'continue_with',
    width: Math.max(Math.floor(width), 200),
  });

  gsiRuntime.renderButtonContainers.add(container);
}

export async function requestGoogleCredential(
  clientId: string,
  onCredential: CredentialCallback
): Promise<GoogleCredentialRequestResult> {
  const now = Date.now();
  if (now < gsiRuntime.manualPromptCooldownUntil) {
    return 'cooldown';
  }

  gsiRuntime.manualPromptCooldownUntil = now + MANUAL_PROMPT_COOLDOWN_MS;

  await loadGoogleGsiScript();
  ensureGoogleIdentityInitialized(clientId);

  const previousCallback = gsiRuntime.credentialCallback;
  let settled = false;

  const settle = (result: GoogleCredentialRequestResult) => {
    if (settled) {
      return result;
    }
    settled = true;
    restoreCredentialCallback(previousCallback);
    return result;
  };

  return new Promise((resolve) => {
    gsiRuntime.credentialCallback = async (credential) => {
      try {
        await onCredential(credential);
        resolve(settle('credential'));
      } catch {
        resolve(settle('dismissed'));
      }
    };

    void defer(0).then(() => {
      window.google!.accounts.id.cancel();
      return defer(16);
    }).then(() => {
      window.google!.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          resolve(settle('dismissed'));
          return;
        }

        if (notification.isSkippedMoment()) {
          resolve(settle('dismissed'));
          return;
        }

        if (notification.isDismissedMoment()) {
          const reason = notification.getDismissedReason();
          if (reason !== 'credential_returned') {
            resolve(settle('dismissed'));
          }
        }
      });
    });
  });
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

export function pushGoogleCredentialHandler(onCredential: CredentialCallback): () => void {
  const previous = gsiRuntime.credentialCallback;
  gsiRuntime.credentialCallback = onCredential;

  return () => {
    if (gsiRuntime.credentialCallback === onCredential) {
      gsiRuntime.credentialCallback = previous;
    }
  };
}

export function resetGoogleOneTapSession() {
  gsiRuntime.autoPromptAttempted = false;
  gsiRuntime.manualPromptCooldownUntil = 0;

  if (gsiRuntime.promptTimerId) {
    window.clearTimeout(gsiRuntime.promptTimerId);
    gsiRuntime.promptTimerId = null;
  }
}
