import { PostHog } from 'posthog-node';

const POSTHOG_KEY = process.env.POSTHOG_API_KEY;
const POSTHOG_HOST = process.env.POSTHOG_HOST || 'https://us.i.posthog.com';

let posthogClient: PostHog | null = null;

if (POSTHOG_KEY) {
  posthogClient = new PostHog(POSTHOG_KEY, {
    host: POSTHOG_HOST,
    flushAt: 10,
    flushInterval: 5000,
  });
}

export function trackEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, any>
) {
  posthogClient?.capture({
    distinctId,
    event,
    properties,
  });
}

export async function shutdownAnalytics() {
  await posthogClient?.shutdown();
}
