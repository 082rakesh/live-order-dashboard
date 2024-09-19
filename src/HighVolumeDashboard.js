import React, { useEffect, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { WebSocketService } from './WebSocketService';

const Dashboard = () => {
	const gridRef = useRef();
	const [rowData, setRowData] = useState([]);
	const [eventBuffer, setEventBuffer] = useState([]);
	const [isRunning, setIsRunning] = useState(true);

	// Define AG Grid columns
	const columnDefs = [
		{ headerName: 'ID', field: 'id', sortable: true },
		{ headerName: 'Task', field: 'item', sortable: true },
		{ headerName: 'Completed', field: 'timestamp', sortable: true },
	];

	useEffect(() => {
		const wsService = new WebSocketService('ws://localhost:8080');

		wsService.connect();
		console.log('useEffect');

		wsService.addListener((event) => {
			if (isRunning) {
				console.log('isRunning', isRunning);
				setEventBuffer((prev) => [...prev, event]);
			}
		});

		const intervalId = setInterval(() => {
			if (eventBuffer.length > 0) {
				const transactions = {
					add: [],
					remove: [],
				};

				eventBuffer.forEach((event) => {
					if (event.type === 'NEW_DATA') {
						console.log('event.type11', event.type);

						transactions.add.push(event.data);
					} else if (event.type === 'DELETE') {
						console.log('event.type22', event.type);

						transactions.remove.push(event.data);
					}
				});

				gridRef.current.api.applyTransaction(transactions);
				setEventBuffer([]); // Clear the buffer after processing
			}
		}, 100); // Process every 100ms

		return () => {
			clearInterval(intervalId);
			wsService.close();
		};
	}, [eventBuffer, isRunning]);

	const stopHandler = () => {
		console.log('stopHandler clicked');
		setIsRunning(false);
		// gridRef.current.api.setRowData([]);
	};
    // Grid ready event handler
	const onGridReady = (params) => {
		gridApi.current = params.api;
		params.api.sizeColumnsToFit();
	};


	return (
		<div className='ag-theme-alpine' style={{ height: 500, width: '100%' }}>
			<div>
				<button onClick={stopHandler}>Stop</button>
			</div>
			{/* <AgGridReact
				rowData={rowData} // Bind the rowData state to the AG Grid
				columnDefs={columnDefs} // Define the columns
				onGridReady={onGridReady}
				getRowId={(params) => params.data.id} // Ensure AG Grid uses 'id' as the unique row identifier
				pagination={true}
				paginationPageSize={10}
			/> */}
			<AgGridReact
				ref={gridRef}
				columnDefs={columnDefs}
				rowData={rowData}
				domLayout='autoHeight'
				paginationPageSize={100} // Optional: Implement pagination
			/>
		</div>
	);
};

export default Dashboard;
