import React, { useEffect, useRef, useState } from "react";
import ReactDOMServer from 'react-dom/server';
import * as d3 from 'd3';
import d3Tip from 'd3-tip';
import "./styles/styles.css";
import "./styles/tip.css";

export default function ChartComp(props) {
    const chartArea = useRef(null);
    // console.log(props.data)
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

        const yAxisGroup = g.append("g")
            .attr("class", "y-bar");

        var gObjs = { g, xAxisGroup, yAxisGroup };
        setG(gObjs);
        update(gObjs);
    }

    function update(g) {
        const { data } = props;
        const width = chartArea.current.clientWidth - margin.left - margin.right,
            height = chartArea.current.clientHeight - margin.top - margin.bottom;
        var subgroups = d3.map(data, function (d) { return (d.Group) }).keys();
        var x = d3.scaleBand()
            .domain(subgroups)
            .range([0, width])
            .padding([0.2])
            .align(0.5);

        var xAxisCall = d3.axisBottom(x).tickSize(0).tickValues(x.domain().filter(function (d, i) { return !(i % 3) }));
        g.xAxisGroup
            .call(xAxisCall)
            .selectAll("path")
            .style("stroke", "#E0E7FF");

        var y = d3.scaleLinear()
            .domain([0, d3.max(data, function (d) { return Math.max(d.In, d.Out) })])
            .range([height, 0]);

        var yAxisCall = d3.axisLeft(y).tickSize(0).ticks(5).tickFormat((d) => {
            return (d > 999) ? d3.format(".2s")(d) : d;
        });

        g.yAxisGroup
            .call(yAxisCall)
            .selectAll("path")
            .style("stroke", "#E0E7FF");

        var subgroups = ['In', 'Out'];

        var xSubgroup = d3.scaleBand()
            .domain(subgroups)
            .range([0, x.bandwidth()])
            .padding([0.05])

        var color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(['#2E5BFF', '#081348']);

        var t = d3.transition().duration(300);

        //destroy old & create grouped bars
        var groupBar = g.g.selectAll(".items")
            .data(data, (d)=>{ return d.Group });

        groupBar.exit()
            .remove();

        groupBar.enter()
            .append('g')
            .attr("class", "items");

        g.g.selectAll(".items")
            .attr("transform", function (d) { return `translate(${x(d.Group) + (x.bandwidth() / 2) - (20 / 2)},0)`; });

        //create & update bars
        var rects = g.g.selectAll('.items').selectAll('rect')
            .data(function (d) { return subgroups.map(function (key) { return { key: key, value: d[key] }; }); })

        rects.exit().remove();

        rects
            .enter().append("rect")
            .attr("fill", d => color(d.key))
            .merge(rects)
            .attr("x", function (d) { return xSubgroup(d.key); })
            .attr("y", function (d) { return y(d.value); })
            .attr("width", 10)
            .attr("height", function (d) { return height - y(d.value); })
            .attr("fill", function (d) { return color(d.key); });
            

    }

    return (
        <div id="chart-area" ref={chartArea}></div>
    )
}