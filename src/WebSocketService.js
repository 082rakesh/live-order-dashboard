export class WebSocketService {
	constructor(url) {
		this.url = url;
		this.socket = null;
		this.listeners = [];
	}

	connect() {
		this.socket = new WebSocket(this.url);
		this.socket.onmessage = (event) => {
			this.notifyListeners(event.data);
		};
	}

	notifyListeners(data) {
		this.listeners.forEach((callback) => callback(JSON.parse(data)));
	}

	addListener(callback) {
		this.listeners.push(callback);
	}

	close() {
		if (this.socket) {
			this.socket.close();
		}
	}
}
