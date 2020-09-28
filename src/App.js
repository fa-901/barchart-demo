import React, { useEffect, useState } from "react";
// import ReactDOMServer from 'react-dom/server';
import "./styles/styles.css";
import "./styles/tip.css";
import ChartComp from './ChartComp';
import json from './data/data.json'

export default function App() {
	const [dType, update] = useState('daily');

	return (
		<div className="App">
			<div className="container card my-3 p-3">
				<h4>Chart Demo</h4>
				<ChartComp data={json[dType]} />
			</div>
		</div>
	);
}
