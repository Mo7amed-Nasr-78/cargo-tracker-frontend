import Sidebar from "./components/Sidebar";
import Shipments from "./Pages/Shipments";
import { Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./App/store";
import "./syle.css";

function App() {
	return (
		<Provider store={store}>
			<main className="h-screen w-full grid grid-cols-12 gap-4 bg-(--bg-color)">
				<Sidebar />
				<Routes>
					<Route path="/" element={<Shipments />}></Route>
				</Routes>
			</main>
		</Provider>
	);
}

export default App;
