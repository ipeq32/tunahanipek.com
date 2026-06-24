import { describe, expect, it } from 'vitest';

import { parseWebhookEvent } from '@/lib/webhooks/parse-event';

describe('parseWebhookEvent', () => {
  it('parses Coolify deployment failure payloads', () => {
    const result = parseWebhookEvent('COOLIFY', {
      success: false,
      event: 'deployment_failure',
      application_name: 'my-blog',
      project: 'Production',
    });

    expect(result.eventType).toBe('deployment_failure');
    expect(result.severity).toBe('ERROR');
    expect(result.title).toContain('my-blog');
  });

  it('parses generic webhook payloads', () => {
    const result = parseWebhookEvent('GENERIC', {
      type: 'backup_completed',
      success: true,
      message: 'Nightly backup finished',
    });

    expect(result.eventType).toBe('backup_completed');
    expect(result.severity).toBe('SUCCESS');
    expect(result.title).toBe('Nightly backup finished');
  });
});
