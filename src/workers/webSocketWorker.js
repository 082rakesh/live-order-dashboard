// public/webSocketWorker.js

let socket;

// Web Worker listens for messages from the main thread
onmessage = (e) => {
	const { type, payload } = e.data;

	if (type === 'START_WEBSOCKET') {
		// Open WebSocket connection
		socket = new WebSocket(payload.url);

		socket.onopen = () => {
			postMessage({ type: 'WEBSOCKET_OPEN', payload: null });
		};

		socket.onmessage = (message) => {
			// Simulate data processing here (you can parse, filter, etc.)
			const data = JSON.parse(message.data);

			// Send processed data back to the main thread
			postMessage({ type: 'NEW_DATA', payload: data });
		};

		// socket.onmessage = handleMessage;

		socket.onclose = () => {
			postMessage({ type: 'WEBSOCKET_CLOSED', payload: null });
		};
	}

	if (type === 'STOP_WEBSOCKET' && socket) {
		socket.close();
	}
};
