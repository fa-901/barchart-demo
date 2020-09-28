import React, { useEffect, useRef, useState } from "react";
import ReactDOMServer from 'react-dom/server';
import * as d3 from 'd3';
import d3Tip from 'd3-tip';
import "./styles/styles.css";
import "./styles/tip.css";

export default function ChartComp(props) {
    const chartArea = useRef(null);
    console.log(props.data)
    const [svg, setG] = useState('');
    const margin = { left: 35, right: 50, top: 10, bottom: 30 };

    useEffect(() => {
        drawChart();
    }, []);

    useEffect(() => {
        svg && update(svg);
    }, [props.data]);

    function drawChart() {
        const width = chartArea.current.clientWidth - margin.left - margin.right,
            height = chartArea.current.clientHeight - margin.top - margin.bottom;

        var g = d3.select("#chart-area")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        const xAxisGroup = g.append("g")
            .attr("transform", `translate(0, ${height})`)
            .attr("class", "x-bar")

        var gObjs = { g, xAxisGroup, };
        setG(gObjs);
        update(gObjs);
    }

    function update(g) {
        const width = chartArea.current.clientWidth - margin.left - margin.right,
            height = chartArea.current.clientHeight - margin.top - margin.bottom;
        var groups = d3.map(props.data, function (d) { return (d.Group) }).keys();
        var x = d3.scaleBand()
            .domain(groups)
            .range([0, width])
            .padding([0.2])
            .align(0.5);

        var xAxisCall = d3.axisBottom(x).tickSize(0).tickValues(x.domain().filter(function (d, i) { return !(i % 3) }));
        g.xAxisGroup
            .call(xAxisCall)
            .selectAll("path")
            .style("stroke", "#E0E7FF")
    }

    return (
        <div id="chart-area" ref={chartArea}></div>
    )
}