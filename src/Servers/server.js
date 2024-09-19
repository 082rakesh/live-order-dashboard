const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

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
