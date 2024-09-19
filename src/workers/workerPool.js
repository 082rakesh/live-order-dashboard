// workerPool.js
export class WorkerPool {
	constructor(workerUrl, poolSize) {
		this.poolSize = poolSize;
		this.workers = [];
		this.idleWorkers = [];
		this.tasksQueue = [];
		this.workerUrl = workerUrl;

		for (let i = 0; i < this.poolSize; i++) {
			this.createWorker();
		}
	}

	// Create a new worker and add it to the idle workers queue
	createWorker() {
		const worker = new Worker(this.workerUrl);
		// this.workers.push(worker); // Keep track of all workers
		console.log('rakesh -- createWorker', worker);

		worker.onmessage = this.handleWorkerResponse.bind(this, worker);
		this.idleWorkers.push(worker); // Add worker to the idle pool
	}

	// Add a task to the task queue and attempt to dispatch it
	addTask(task) {
		console.log('rakesh -- addTask', task);
		this.tasksQueue.push(task);
		this.dispatchTask();
	}

	// Dispatch a task to an available worker
	dispatchTask() {
		console.log(
			'rakesh -- addTask',
			this.idleWorkers.length,
			this.tasksQueue.length
		);

		if (this.idleWorkers.length > 0 && this.tasksQueue.length > 0) {
			const worker = this.idleWorkers.shift();
			const task = this.tasksQueue.shift();
			console.log('rakesh --> worker and task', worker, task);
			worker.postMessage(task);
		}
	}

	// Handle worker responses and return them to the idle queue
	handleWorkerResponse(worker, event) {
		console.log('rakesh -- handleWorkerResponse');

		const { taskId, result } = event.data;
		console.log(`rakesh Order ${taskId} completed with result:`, result);

		// After the worker finishes the task, mark it as idle
		this.idleWorkers.push(worker);

		// Try to dispatch more tasks if available
		this.dispatchTask();
	}
}
