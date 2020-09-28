import React, { useEffect, useRef, Fragment } from "react";
import ReactDOMServer from 'react-dom/server';
import * as d3 from 'd3';
import d3Tip from 'd3-tip';
import "./styles/styles.css";
import "./styles/tip.css";

export default function ChartComp(props) {
    const chartArea = useRef(null);
    console.log(props.data)

    return (
        <div id="chart-area" ref={chartArea}></div>
    )
}