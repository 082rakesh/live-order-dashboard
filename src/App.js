import './App.css';
import Dashboard from './screens/Dashboard';
import LiveDashboard from './screens/LiveDashboard';
import { Provider } from 'react-redux';
import store from './redux/store';

function App() {
	return (
		<Provider store={store}>
			<Dashboard />;
		</Provider>
	);
}

export default App;
