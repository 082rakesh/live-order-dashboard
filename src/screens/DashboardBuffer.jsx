import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import webworker from '../workers/webSocketWorker';
import { useDispatch, useSelector } from 'react-redux';
import { addEvent } from '../redux/eventSlice';

export default function App() {
	// const [rowData, setRowData] = useState([]);
	const workerRef = useRef(null); // Reference for the web worker
	// const gridApi = useRef(null);
	const gridRef = useRef(null);
	const [gridApi, setGridApi] = useState(null); // Store the Grid API reference

	const dispatch = useDispatch();
	const eventList = useSelector((state) => state.events.eventList);

	// Other option is to maintain EventBuffer to store event and dequeue in certain interval
	// const [eventBuffer, setEventBuffer] = useState([]); // Buffer to store events temporarily

	// const eventBuffer = useRef([]); // Buffer to store events temporarily

	// Define AG Grid columns
	// TODO: add column dynamically
	let columnDefs = [
		{ headerName: 'ID', field: 'id', sortable: true },
		{ headerName: 'Task', field: 'item', sortable: true },
		{ headerName: 'Completed', field: 'timestamp', sortable: true },
	];

	// Delete a row from the AG Grid based on the provided ID
	const deleteRowFromGrid = useCallback(
		(rowId) => {
			// console.log('deleted Row with ID 123:', rowId);
			if (gridApi) {
				// Find the row data to delete based on its ID
				const rowNode = gridApi.getRowNode(rowId);
				console.log('deleted Row with ID:', rowId, rowNode);

				if (rowNode) {
					// Use api.applyTransaction to delete the row
					gridApi.applyTransactionAsync({
						remove: [rowNode.data],
					});
				} else {
					console.error('Row with ID:', rowId, 'not found.');
				}
			}
		},
		[gridApi]
	);

	useEffect(() => {
		console.log('-------- useEffect @@-------');

		if (gridApi) {
			if (eventList?.length > 0) {
				console.log(
					'check eventList length and type ',
					eventList.length,
					eventList[0]?.type
				);

				if (eventList[0]?.type === 'NEW_DATA') {
					gridApi.applyTransactionAsync({
						add: [eventList[0]?.data],
					});
				} else if (eventList[0]?.type === 'DELETE') {
					deleteRowFromGrid(eventList[0]?.data.id);
				}
			}

			gridApi.ensureIndexVisible(0);
		}
	}, [deleteRowFromGrid, eventList, gridApi]);

	// Batch process the buffered events every 500ms
	// dequeue in Regular interval
	/*
    useEffect(() => {
        const interval = setInterval(() => {
            if (eventBuffer.length > 0 && gridApi) {
				// dispatch event in 500 MS interval
				dispatch(addEvent(payload));

            	// Clear the event buffer after processing
            	eventBuffer.current = [];
            }
        }, 500);  // Update grid every 500ms

        return () => {
            clearInterval(interval);  // Clean up the interval on unmount
        };
    }, [eventBuffer, gridApi]);
	*/

	// Initialize the Web Worker on component mount
	useEffect(() => {
		console.log(' ----   useEffect 22 @@@@------');

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
			console.log('event is', payload);

			dispatch(addEvent(payload));

			// eventBuffer.current.push(payload); // TODO: we can open once buffer being implemented
			// console.log('eventBuffer', eventBuffer);

			// setEventBuffer((prevBuffer) => [...prevBuffer, payload]);

			// if (type === 'NEW_DATA') {
			// 	// Insert the new data at the top of the grid
			// 	console.log('element', payload);
			// 	insertRowAtTop(payload);
			// } else if (type === 'DELETE') {
			// 	// delete row from grid
			// 	deleteRowFromGrid(payload?.id);
			// }

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
	}, [dispatch]);

	// Insert a new row at the top of the AG Grid
	// const insertRowAtTop = (newRowData) => {
	// 	console.log('insertRowAtTop123 -', newRowData);

	// 	if (gridApi.current) {
	// 		console.log('is gridApi.current available');

	// 		// Use api.applyTransaction to insert a new row at the top
	// 		gridApi.current.applyTransaction({
	// 			add: [newRowData],
	// 			addIndex: 0, // Add at index 0 to place at the top
	// 		});
	// 	} else {
	// 		console.log('is gridApi.current not available');

	// 		// Update the state if the gridApi is not available yet
	// 		// setRowData((prevData) => [...prevData, newRowData]);
	// 	}
	// };

	// Grid ready event handler
	const onGridReady = (params) => {
		// gridApi.current = params.api;
		setGridApi(params.api); // Store the Grid API reference
		params.api.sizeColumnsToFit();
	};

	const stopHandler = () => {
		workerRef.current.terminate();
	};

	return (
		<div className='ag-theme-alpine' style={{ width: '100%' }}>
			<div>
				<button onClick={stopHandler}>Stop</button>
			</div>
			<AgGridReact
				// rowData={eventList} // Bind the rowData state to the AG Grid
				ref={gridRef}
				columnDefs={columnDefs} // Define the columns
				onGridReady={onGridReady}
				// getRowId={(params) => params.data.id} // Ensure AG Grid uses 'id' as the unique row identifier
				getRowId={(params) => params.id} // Ensure AG Grid uses 'id' as the unique row identifier
				// rowBuffer={0} // Prevent rendering of off-screen rows
				domLayout='autoHeight'
				// debounceVerticalScrollbar={true}
				// suppressScrollOnNewData={true}
				// asyncTransactionWaitMillis={2000}
			/>
		</div>
	);
}
