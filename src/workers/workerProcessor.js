onmessage = function (event) {
	const { taskId, data } = event.data;

	// Simulate intensive data processing (e.g., filtering or sorting)
	console.log('rakesh ->>>>>>>>>>> outside of onmessage', data);
	const processedData = processData(data);

	// Send the result back to the main thread
	postMessage({ taskId, result: processedData });
};

function processData(data) {
	// For example, sort data by some field
	return data.sort((a, b) => a.value - b.value);
}
