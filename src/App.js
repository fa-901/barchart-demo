import React, { useEffect, useState } from "react";
// import ReactDOMServer from 'react-dom/server';
import "./styles/styles.css";
import "./styles/tip.css";
import ChartComp from './ChartComp';
import json from './data/data.json';
import Select from 'react-select';

export default function App() {
	const [dType, update] = useState('daily');
	var options = [
		{ label: 'Daily', value: 'daily' },
		{ label: 'Weekly', value: 'weekly' },
		{ label: 'Monthly', value: 'monthly' },
	]

	return (
		<div className="App">
			<div className="container card my-3 p-3">
				<div className='d-flex'>
					<div className=''>
						<h4>Chart Demo</h4>
					</div>
					<div className='ml-auto w-25'>
						<Select
							placeholder='Select Data'
							options={options}
							onChange={(v) => { update(v.value) }}
							value={options.filter((v) => v.value === dType)}
						/>
					</div>
				</div>
				<ChartComp data={json[dType]} groups={['In', 'Out']} />
			</div>
		</div>
	);
}
