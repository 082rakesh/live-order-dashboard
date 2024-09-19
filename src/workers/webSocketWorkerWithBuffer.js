// public/webSocketWorker.js

let socket;

let messageBuffer = [];
const BUFFER_LIMIT = 100; // Adjust the buffer limit as needed
const BATCH_INTERVAL = 1000; // Send a batch every 100ms

const processMessage = (message) => {
	messageBuffer.push(message);

	// If the buffer limit is reached, send the batch
	if (messageBuffer.length >= BUFFER_LIMIT) {
		postMessage({
			type: 'NEW_DATA_BATCH',
			payload: { data: messageBuffer },
		});
		messageBuffer = []; // Clear the buffer
	}
};

// WebSocket message handling
const handleMessage = (event) => {
	const data = JSON.parse(event.data);
	// Assume data contains the event type
	processMessage(data);
};

// Web Worker listens for messages from the main thread
onmessage = (e) => {
	const { type, payload } = e.data;

	if (type === 'START_WEBSOCKET') {
		// Open WebSocket connection
		socket = new WebSocket(payload.url);

		socket.onopen = () => {
			postMessage({ type: 'WEBSOCKET_OPEN', payload: null });
		};

		socket.onmessage = handleMessage;

		socket.onclose = () => {
			postMessage({ type: 'WEBSOCKET_CLOSED', payload: null });
		};

		setInterval(() => {
			if (messageBuffer.length > 0) {
				postMessage({
					type: 'NEW_DATA_BATCH',
					payload: { data: messageBuffer },
				});
				messageBuffer = [];
			}
		}, BATCH_INTERVAL);
	}

	if (type === 'STOP_WEBSOCKET' && socket) {
		socket.close();
	}
};
