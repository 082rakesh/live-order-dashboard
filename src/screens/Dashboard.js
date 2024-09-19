import React, { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import webworker from '../workers/webSocketWorker'

export default function App() {
	const [rowData, setRowData] = useState([]);
	const workerRef = useRef(null); // Reference for the web worker
	const gridApi = useRef(null);

	// Define AG Grid columns
	// TODO: add column dynamically
	let columnDefs = [
		{ headerName: 'ID', field: 'id', sortable: true },
		{ headerName: 'Task', field: 'item', sortable: true },
		{ headerName: 'Completed', field: 'timestamp', sortable: true },
	];

	// Initialize the Web Worker on component mount
	useEffect(() => {
		console.log('useEffect');
		// Create a Web Worker to handle WebSocket connection
		workerRef.current = new Worker(
			new URL('../workers/webSocketWorker.js', import.meta.url)
		);

		// Start the WebSocket connection via the Web Worker
		workerRef.current.postMessage({
			type: 'START_WEBSOCKET',
			payload: { url: 'ws://localhost:8080' }, // Replace with actual WebSocket URL
		});

		// Listen for messages from the Web Worker
		workerRef.current.onmessage = (event) => {
			const { type, payload } = event?.data;
			console.log('event is', event);

			if (type === 'NEW_DATA') {
				// Insert the new data at the top of the grid
				console.log('element', payload);
				insertRowAtTop(payload.data);
			} else if (type === 'DELETE') {
				// delete row from grid
				deleteRowFromGrid(payload?.data.id);
			}

			if (type === 'WEBSOCKET_OPEN') {
				console.log('WebSocket connection opened');
			}

			if (type === 'WEBSOCKET_CLOSED') {
				console.log('WebSocket connection closed');
			}
		};

		// Cleanup Web Worker on component unmount
		return () => {
			if (workerRef.current) {
				workerRef.current.postMessage({ type: 'STOP_WEBSOCKET' });
				workerRef.current.terminate();
			}
		};
	}, []);

	// Insert a new row at the top of the AG Grid
	const insertRowAtTop = (newRowData) => {
		if (gridApi.current) {
			// Use api.applyTransaction to insert a new row at the top
			gridApi.current.applyTransactionAsync({
				add: [newRowData],
				addIndex: 0, // Add at index 0 to place at the top
			});
		} else {
			// Update the state if the gridApi is not available yet
			setRowData((prevData) => [...prevData, newRowData]);
		}
	};

	// Delete a row from the AG Grid based on the provided ID
	const deleteRowFromGrid = (rowId) => {
		if (gridApi.current) {
			// Find the row data to delete based on its ID
			const rowNode = gridApi.current.getRowNode(rowId);
			if (rowNode) {
				// Use api.applyTransaction to delete the row
				gridApi.current.applyTransaction({
					remove: [rowNode.data],
				});
				console.error('deleted Row with ID:', rowId);
			} else {
				console.error('Row with ID:', rowId, 'not found.');
			}
		}
	};

	// Grid ready event handler
	const onGridReady = (params) => {
		gridApi.current = params.api;
		params.api.sizeColumnsToFit();
	};

	const stopHandler = () => {
		workerRef.current.terminate();
	};

	return (
		<div className='ag-theme-alpine' style={{ height: 1000, width: '100%' }}>
			<div>
				<button onClick={stopHandler}>Stop</button>
			</div>
			<AgGridReact
				rowData={rowData} // Bind the rowData state to the AG Grid
				columnDefs={columnDefs} // Define the columns
				onGridReady={onGridReady}
				getRowId={(params) => params.data.id} // Ensure AG Grid uses 'id' as the unique row identifier
				rowBuffer={0} // Prevent rendering of off-screen rows
				domLayout='autoHeight'
				asyncTransactionWaitMillis={5000}
			/>
		</div>
	);
}
