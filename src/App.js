import React, { useEffect, useRef, Fragment } from "react";
import ReactDOMServer from 'react-dom/server';
import * as d3 from 'd3';
import d3Tip from 'd3-tip';
import "./styles/styles.css";
import "./styles/tip.css";
import json from './data/data.json'

export default function App() {
	const chartArea = useRef(null);
	console.log(json)

	return (
		<div className="App">
			<div className="container">
				<div id="chart-area" ref={chartArea}></div>
			</div>
		</div>
	);
}
