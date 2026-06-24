import { describe, expect, it } from 'vitest';

import {
  buildWebhookEndpointUrl,
  formatWebhookEndpointDisplay,
} from '@/lib/webhooks/build-endpoint-url';

describe('formatWebhookEndpointDisplay', () => {
  it('shows a readable masked URL without unicode percent-encoding', () => {
    const secret =
      '78cf6ca78f222b2446e8336ce2e792154ca9ae9823cf7debe8fff99c0b788ac3';
    const display = formatWebhookEndpointDisplay('alicinvar-com', secret);

    expect(display.maskedUrl).toBe(
      'http://localhost:3000/api/webhooks/alicinvar-com?key=****8ac3',
    );
    expect(display.maskedUrl).not.toContain('%E2%80%A2');
    expect(display.queryHint).toBe('?key=****8ac3');
    expect(display.path).toBe('http://localhost:3000/api/webhooks/alicinvar-com');
  });

  it('builds the full copy URL with the real secret', () => {
    const secret = 'abc123def4567890';
    const full = buildWebhookEndpointUrl('demo', secret);

    expect(full).toContain('?key=abc123def4567890');
  });
});
