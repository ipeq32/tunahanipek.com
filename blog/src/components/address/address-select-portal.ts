export type AddressSelectDropdownPosition = {
  top: number;
  left: number;
  width: number;
  strategy: 'fixed' | 'absolute';
};

export function resolveAddressSelectPortal(
  trigger: HTMLElement | null
): HTMLElement {
  if (!trigger) return document.body;

  const scrollArea = trigger.closest('[data-dialog-scroll]');
  if (scrollArea instanceof HTMLElement) {
    return scrollArea;
  }

  const dialog = trigger.closest('[role="dialog"]');
  if (dialog instanceof HTMLElement) {
    return dialog;
  }

  return document.body;
}

export function measureAddressSelectDropdown(
  trigger: HTMLElement,
  portal: HTMLElement
): AddressSelectDropdownPosition {
  const triggerRect = trigger.getBoundingClientRect();

  if (portal === document.body) {
    return {
      top: triggerRect.bottom + 4,
      left: triggerRect.left,
      width: triggerRect.width,
      strategy: 'fixed',
    };
  }

  const portalRect = portal.getBoundingClientRect();

  return {
    top: triggerRect.bottom - portalRect.top + portal.scrollTop + 4,
    left: triggerRect.left - portalRect.left + portal.scrollLeft,
    width: triggerRect.width,
    strategy: 'absolute',
  };
}
