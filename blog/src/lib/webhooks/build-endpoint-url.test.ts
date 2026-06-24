import { describe, expect, it } from 'vitest';

import {
  buildWebhookEndpointUrl,
  maskWebhookEndpointUrl,
} from '@/lib/webhooks/build-endpoint-url';

describe('maskWebhookEndpointUrl', () => {
  it('masks the key query parameter in webhook URLs', () => {
    const url = buildWebhookEndpointUrl(
      'alicinvar-com',
      '78cf6ca78f222b2446e8336ce2e792154ca9ae9823cf7debe8fff99c0b788ac3',
    );

    expect(maskWebhookEndpointUrl(url)).toContain('key=%E2%80%A2%E2%80%A2%E2%80%A2%E2%80%A28ac3');
    expect(maskWebhookEndpointUrl(url)).not.toContain('78cf6ca7');
  });
});
