const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

const sendUpdates = (ws) => {
	const eventType = Math.random() < 0.5 ? 'NEW_DATA' : 'DELETE';

	if (eventType === 'NEW_DATA') {
		const order = {
			// id: `${Math.floor(Math.random() * 1000)}`,
			id: idCounter++,
			item: `Order ${Math.floor(Math.random() * 100)}`,
			quantity: Math.floor(Math.random() * 5) + 1,
			timestamp: new Date().toLocaleTimeString(),
		};

		dataStore[order.id] = order;
		ws.send(JSON.stringify({ type: 'NEW_DATA', data: order }));
	} else {
		if (Object.keys(dataStore).length > 0) {
			const keys = Object.keys(dataStore);
			const randomKey = keys[Math.floor(Math.random() * keys.length)];
			const deletedData = dataStore[randomKey];
			delete dataStore[randomKey];
			ws.send(JSON.stringify({ type: 'DELETE', data: deletedData }));
		}
	}
};

// Simulate order creation
setInterval(() => {
	//
	const order = {
		id: `${Math.floor(Math.random() * 1000)}`,
		item: `Order ${Math.floor(Math.random() * 100)}`,
		quantity: Math.floor(Math.random() * 5) + 1,
		timestamp: new Date().toLocaleTimeString(),
	};

	// Broadcast order to all clients
	wss.clients.forEach((client) => {
		if (client.readyState === WebSocket.OPEN) {
			client.send(JSON.stringify(order));
		}
	});
}, 2000); // Sends an order every 1 MS

console.log('WebSocket server is running on ws://localhost:8080');
