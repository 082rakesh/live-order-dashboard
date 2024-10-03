// server.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let dataStore = {};
let idCounter = 0;
const sendUpdates = (ws) => {
	// const eventType = Math.random() < 0.5 ? 'NEW_DATA' : 'DELETE';

	const order = {
		// id: `${Math.floor(Math.random() * 1000)}`,
		id: idCounter++,
		item: `Order ${Math.floor(Math.random() * 100)}`,
		quantity: Math.floor(Math.random() * 5) + 1,
		timestamp: new Date().toLocaleTimeString(),
	};

	dataStore[order.id] = order;
	ws.send(JSON.stringify({ type: 'NEW_DATA', data: order }));

	/*
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
		*/
};

wss.on('connection', (ws) => {
	console.log('New client connected');
	const intervalId = setInterval(() => sendUpdates(ws), 2000);

	ws.on('close', () => {
		clearInterval(intervalId);
		console.log('Client disconnected');
	});
});

console.log('WebSocket server is running on ws://localhost:8080');
