const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

interface NotificationContent {
  title: string;
  message: string;
  url?: string;
  data?: Record<string, string>;
}

interface NotificationTarget {
  segment?: string;
  userIds?: string[];
  tags?: Record<string, string>;
}

export async function sendNotification(
  content: NotificationContent,
  target: NotificationTarget
): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!ONESIGNAL_REST_API_KEY || !ONESIGNAL_APP_ID) {
    console.error('OneSignal credentials not configured');
    return { success: false, error: 'OneSignal not configured' };
  }

  const body: Record<string, unknown> = {
    app_id: ONESIGNAL_APP_ID,
    headings: { en: content.title },
    contents: { en: content.message },
    url: content.url,
    data: content.data,
  };

  if (target.segment) {
    body.included_segments = [target.segment];
  } else if (target.userIds && target.userIds.length > 0) {
    body.include_external_user_ids = target.userIds;
  } else if (target.tags) {
    body.filters = Object.entries(target.tags).map(([key, value]) => ({
      field: 'tag',
      key,
      relation: '=',
      value,
    }));
  }

  try {
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, id: data.id };
    } else {
      return { success: false, error: data.errors?.[0] || 'Unknown error' };
    }
  } catch (error) {
    console.error('Failed to send notification:', error);
    return { success: false, error: 'Network error' };
  }
}

export async function sendDailyDropNotification(
  flavorCount: number,
  rareCount: number
): Promise<{ success: boolean }> {
  const title = "☀️ Today's Drops Are Live!";
  const message =
    rareCount > 0
      ? `${flavorCount} flavors including ${rareCount} rare ${rareCount === 1 ? 'one' : 'ones'}!`
      : `${flavorCount} flavors available today`;

  return sendNotification(
    { title, message, url: '/' },
    { segment: 'Subscribed Users' }
  );
}

export async function sendWatchlistAlertNotification(
  userIds: string[],
  flavorName: string,
  daysSinceLast: number | null
): Promise<{ success: boolean }> {
  const title = `🚨 ${flavorName} is back!`;
  const message =
    daysSinceLast && daysSinceLast > 0
      ? `Last seen ${daysSinceLast} days ago. Tap to view today's menu.`
      : "Tap to view today's menu.";

  return sendNotification(
    { title, message, url: '/', data: { flavor: flavorName } },
    { userIds }
  );
}

export async function sendSoldOutNotification(
  userIds: string[],
  flavorName: string
): Promise<{ success: boolean }> {
  const title = `⚠️ ${flavorName} just sold out`;
  const message = 'Better luck next time!';

  return sendNotification(
    { title, message, url: '/', data: { flavor: flavorName, soldOut: 'true' } },
    { userIds }
  );
}

export function initializeOneSignal(): void {
  if (typeof window === 'undefined' || !ONESIGNAL_APP_ID) return;

  // Dynamically load OneSignal SDK
  const script = document.createElement('script');
  script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
  script.defer = true;
  script.onload = () => {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.OneSignalDeferred.push(async function (OneSignal: any) {
      await OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        safari_web_id: process.env.NEXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID,
        notifyButton: {
          enable: false,
        },
        allowLocalhostAsSecureOrigin: process.env.NODE_ENV === 'development',
      });
    });
  };
  document.head.appendChild(script);
}

export async function setExternalUserId(userId: string): Promise<void> {
  if (typeof window === 'undefined') return;

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  window.OneSignalDeferred.push(async function (OneSignal: any) {
    await OneSignal.login(userId);
  });
}

export async function promptForNotifications(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  return new Promise((resolve) => {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.OneSignalDeferred.push(async function (OneSignal: any) {
      const permission = await OneSignal.Notifications.requestPermission();
      resolve(permission);
    });
  });
}

export async function setNotificationTags(
  tags: Record<string, string>
): Promise<void> {
  if (typeof window === 'undefined') return;

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  window.OneSignalDeferred.push(async function (OneSignal: any) {
    await OneSignal.User.addTags(tags);
  });
}

// TypeScript declarations for OneSignal
declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: unknown) => Promise<void>>;
  }
}
