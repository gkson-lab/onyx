// Shows a notification when Onyx sends one, and opens the app when it is tapped. Nothing is cached: the app is
// served by your own PC, and a stale copy would show old data.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('push', (e) => {
	let data = { title: 'Onyx', body: '' };
	try {
		data = e.data.json();
	} catch {
		data.body = e.data ? e.data.text() : '';
	}
	e.waitUntil(self.registration.showNotification(data.title, { body: data.body, icon: '/icon.svg', badge: '/icon.svg' }));
});
self.addEventListener('notificationclick', (e) => {
	e.notification.close();
	e.waitUntil(self.clients.matchAll({ type: 'window' }).then((all) => (all[0] ? all[0].focus() : self.clients.openWindow('/'))));
});
