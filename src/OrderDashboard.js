// App.js
import React, { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { WorkerPool } from './workers/workerPool';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

function OrderDashboard() {
	const [gridData, setGridData] = useState([]);
	const [wsConnected, setWsConnected] = useState(false);

	const workerPool = useRef(null); // Ref for worker pool
	const websocket = useRef(null); // Ref for WebSocket connection

	const WEBSOCKET_URL = 'ws://localhost:8080';

	// Initialize a worker pool with 4 workers
	// const workerPool = new WorkerPool('worker.js', 4);

	// Set AG Grid column definitions
	const columnDefs = [
		{ headerName: 'ID', field: 'id', sortable: true },
		{ headerName: 'Task', field: 'item', sortable: true },
		{ headerName: 'Completed', field: 'quantity', sortable: true },
	];

	// Initial loading of the data
	useEffect(() => {
		workerPool.current = new WorkerPool('./workers/workerProcessor.js', 4);
		// Initialize WebSocket connection
		websocket.current = new WebSocket(WEBSOCKET_URL);

		websocket.current.onopen = () => {
			console.log('WebSocket connection opened');
			setWsConnected(true);
		};
		websocket.current.onmessage = (event) => {
			const messageData = JSON.parse(event.data);

			console.log('rakesh --Received data from WebSocket:', messageData);

			// Add incoming data to the worker pool for processing
			workerPool.current.addTask({
				taskId: Date.now(),
				data: messageData,
			});
		};

		websocket.current.onerror = (error) => {
			console.error('WebSocket error:', error);
		};

		websocket.current.onclose = () => {
			console.log('WebSocket connection closed');
			setWsConnected(false);
		};

		// Clean up WebSocket connection and workers on unmount
		return () => {
			websocket.current?.close();
			workerPool.current = null;
		};
	}, []);

	// Handle processed data from workers and update the grid
	useEffect(() => {
		if (workerPool.current) {
			console.log('rakesh useEffect @@ workerPool.current', workerPool.current);

			workerPool.current.workers.forEach((worker) => {
				worker.onmessage = (event) => {
					const { taskId, result } = event.data;
					console.log(
						`rakesh Received processed data from task ${taskId}`,
						result,
						event
					);

					// Set the processed data to AG Grid
					setGridData((prevData) => [...prevData, ...result]);
				};
			});
		}
	}, [workerPool]);

	const stopHandler = () => {
		websocket.current?.close();
		workerPool.current = null;
	};

	return (
		<div className='ag-theme-alpine' style={{ height: 500, width: 600 }}>
			<h1>AG Grid with WebSocket and Worker Pool</h1>
			<div>
				<button onClick={stopHandler}> Stop </button>
			</div>
			<AgGridReact
				rowData={gridData}
				columnDefs={columnDefs}
				pagination={true}
				paginationPageSize={10}
			/>
		</div>
	);
}

export default OrderDashboard;
