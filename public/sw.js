// Service Worker for Web Push Notifications
const CACHE_NAME = 'medicine-reminder-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(clients.claim());
});

// Push event handler
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received', event);
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Medicine Reminder', body: event.data.text() };
    }
  }

  const title = data.title || 'Medicine Reminder';
  const options = {
    body: data.body || 'Time to take your medication',
    icon: '/placeholder.svg',
    badge: '/placeholder.svg',
    tag: data.tag || 'medication-reminder',
    requireInteraction: true,
    actions: [
      {
        action: 'taken',
        title: 'Taken ✓',
      },
      {
        action: 'snooze',
        title: 'Snooze 15m',
      },
      {
        action: 'skip',
        title: 'Skip',
      },
    ],
    data: {
      actionToken: data.actionToken,
      dosePlanId: data.dosePlanId,
      url: data.url || '/',
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event);
  
  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  // Handle actions - call secure edge function
  if (action === 'taken' || action === 'snooze' || action === 'skip') {
    const supabaseUrl = 'https://kpgjuydsavwinwbchunz.supabase.co';
    event.waitUntil(
      fetch(`${supabaseUrl}/functions/v1/intake-action/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actionToken: data.actionToken,
          dosePlanId: data.dosePlanId,
          snoozeMinutes: action === 'snooze' ? 15 : undefined,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            console.error('Failed to process action:', action);
          } else {
            console.log(`Successfully processed ${action}`);
          }
        })
        .catch((error) => {
          console.error('Error processing action:', error);
        })
    );
  }

  // Open or focus the app window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const url = data.url || '/';
      
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window if none exists
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Sync event for background sync (future use)
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'sync-dose-status') {
    event.waitUntil(
      // Sync logic here
      Promise.resolve()
    );
  }
});
