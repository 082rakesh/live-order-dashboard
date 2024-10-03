import React, {
	useState,
	useEffect,
	useRef,
	useCallback,
	Profiler,
} from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useDispatch, useSelector } from 'react-redux';
import { addEvent } from '../redux/eventSlice';

export default function App() {
	// const [rowData, setRowData] = useState([]);
	const workerRef = useRef(null); // Reference for the web worker
	const gridRef = useRef(null);
	const [gridApi, setGridApi] = useState(null); // Store the Grid API reference

	const dispatch = useDispatch();
	const eventList = useSelector((state) => state.events.eventList);

	const columnDefs = [
		{ headerName: 'ID', field: 'id', sortable: true, editable: true },
		{ headerName: 'Task', field: 'item', sortable: true },
		{ headerName: 'Completed', field: 'timestamp', sortable: true },
	];

	// // Delete a row from the AG Grid based on the provided ID
	// const deleteRowFromGrid = useCallback(
	// 	(rowId) => {
	// 		// // console.log('deleted Row with ID 123:', rowId);
	// 		if (gridApi) {
	// 			// Find the row data to delete based on its ID
	// 			const rowNode = gridApi.getRowNode(rowId);
	// 			if (rowNode) {
	// 				// Use api.applyTransaction to delete the row
	// 				gridApi.applyTransactionAsync({
	// 					remove: [rowNode.data],
	// 				});
	// 			}
	// 			// else {
	// 			// 	console.error('Row with ID:', rowId, 'not found.');
	// 			// }
	// 		}
	// 	},
	// 	[gridApi]
	// );

	useEffect(() => {
		console.log('-------- useEffect @@-------');

		if (eventList?.length > 0) {
			if (eventList[0]?.type === 'NEW_DATA') {
				gridApi.applyTransactionAsync({
					add: [eventList[0]?.data],
				});
			}
			// else if (eventList[0]?.type === 'DELETE') {
			// 	deleteRowFromGrid(eventList[0]?.data.id);
			// }
		}
	}, [eventList, gridApi]);

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
			console.log('dispatch event');
			dispatch(addEvent(payload));

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

	// Grid ready event handler
	const onGridReady = (params) => {
		console.log('onGridReady');
		// gridApi.current = params.api;
		setGridApi(params.api); // Store the Grid API reference
		// params.api.sizeColumnsToFit();
	};

	const stopHandler = () => {
		workerRef.current.terminate();
	};

	// function onRenderCallback(id, phase, actualDuration) {
	// 	console.log('onRenderCallback ', id, phase, actualDuration);
	// }

	function onRenderCallback(
		id, // the "id" prop of the Profiler tree that has just committed
		phase, // either "mount" (if the tree just mounted) or "update" (if it re-rendered)
		actualDuration, // time spent rendering the committed update
		baseDuration, // estimated time to render the entire subtree without memoization
		startTime, // when React began rendering this update
		commitTime, // when React committed this update
		interactions // the Set of interactions belonging to this update
	) {
		// Aggregate or log render timings...
		// console.log(
		// 	'onRenderCallback ',
		// 	id,
		// 	phase,
		// 	actualDuration,
		// 	baseDuration,
		// 	startTime,
		// 	commitTime,
		// 	interactions
		// );
	}

	return (
		<Profiler id='Dashboard' onRender={onRenderCallback}>
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
					debounceVerticalScrollbar={true}
					suppressScrollOnNewData={true}
					asyncTransactionWaitMillis={2000}
				/>
			</div>
		</Profiler>
	);
}
