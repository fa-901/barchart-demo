import React, { Fragment, useEffect, useRef, useState } from "react";
import ReactDOMServer from 'react-dom/server';
import * as d3 from 'd3';
import d3Tip from 'd3-tip';
import "./styles/styles.css";
import "./styles/tip.css";

export default function ChartComp(props) {
    const chartArea = useRef(null);
    const [svg, setG] = useState('');
    const margin = { left: 35, right: 50, top: 10, bottom: 30 };
    const bar_maxW = 7;

    useEffect(() => {
        drawChart();
        window.addEventListener('resize', reportWindowSize);

        return function cleanup() {
            window.removeEventListener('resize', reportWindowSize);
        };

    }, []);

    useEffect(() => {
        svg && update(svg);
    }, [props.data]);

    function drawChart() {
        const width = chartArea.current.clientWidth - margin.left - margin.right,
            height = chartArea.current.clientHeight - margin.top - margin.bottom;

        const elem = document.getElementById("chart-area");
        elem.innerHTML = '';

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

        const yAxisGrid = g.append("g")
            .attr("class", "y-grid");

        const xAxisGrid = g.append("g")
            .attr("class", "x-grid");

        var gObjs = { g, xAxisGroup, yAxisGroup };
        setG(gObjs);
        update(gObjs);
    }

    function update(g) {
        const { data } = props;
        const width = chartArea.current.clientWidth - margin.left - margin.right,
            height = chartArea.current.clientHeight - margin.top - margin.bottom;

        //remove old tips
        d3.selectAll('.d3-tip').remove();

        //transition function.
        var t = d3.transition().duration(300);

        var subgroups = d3.map(data, function (d) { return (d.Group) }).keys();
        var x = d3.scaleBand()
            .domain(subgroups)
            .range([0, width])
            .paddingInner(.1)
            .paddingOuter(.1);
            // .padding([0.2])
            // .align(0.5);

        var xAxisCall = d3.axisBottom(x).tickSize(0).tickValues(x.domain().filter(function (d, i) { return !(i % 3) }));
        g.xAxisGroup
            .transition(t)
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
            .transition(t)
            .call(yAxisCall)
            .selectAll("path")
            .style("stroke", "#E0E7FF");

        //show tip
        var tip = d3Tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html((d) => {
                var key = d?.key || '';
                var val = d?.value || '';
                let html = (
                    <Fragment>
                        <div>
                            <span>{key}:</span><span className='ml-2 text-standard'>{val}</span>
                        </div>
                    </Fragment>
                )
                return ReactDOMServer.renderToStaticMarkup(html);
            });
        g.g.call(tip);

        var subgroups = ['In', 'Out'];

        //In-Out scale
        var xSubgroup = d3.scaleBand()
            .domain(subgroups)
            .range([0, x.bandwidth()])
            .paddingInner(0.2)
            .paddingOuter(0.5)

        //color scale
        var color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(['#2E5BFF', '#081348']);

        //destroy old & create grouped bars
        var groupBar = g.g.selectAll(".items")
            .data(data, (d)=>{ return d.Group });

        groupBar.exit()
            .remove();

        groupBar.enter()
            .append('g')
            .attr("class", "items");

        g.g.selectAll(".items")
            .attr("transform", function (d) { return `translate(${x(d.Group)},0)`; });

        //create & update bars
        var rects = g.g.selectAll('.items').selectAll('rect')
            .data(function (d) { return subgroups.map(function (key) { return { key: key, value: d[key] }; }); })

        rects.exit().remove();

        rects
            .enter().append("rect")
            .attr("fill", d => color(d.key))
            .merge(rects)
            .attr("y", y(0))
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            .transition(t)
            .attr("transform", function (d) { //puts bars close together
                let def = xSubgroup.bandwidth();
                let x = def > 0 ? (def - bar_maxW) : 0;
                return `translate(${d.key === 'In' ? x : 0},0)`;
            })
            .attr("x", function (d) { return xSubgroup(d.key); })
            .attr("y", function (d) { return y(d.value); })
            .attr("width", Math.min(bar_maxW, xSubgroup.bandwidth()))
            .attr("height", function (d) { return height - y(d.value); })
            .attr("fill", function (d) { return color(d.key); });

        //create gridlines
        var yGridCall = d3.axisLeft(y).tickSize((-width)).ticks(5).tickFormat('');
        var yAxisGrid = g.g.selectAll('.y-grid');
        yAxisGrid
            .transition(t)
            .call(yGridCall)
            .selectAll("path")
            .style("stroke", "none");

        var xGridCall = d3.axisBottom(x).tickSize((height)).ticks(5).tickFormat('');
        var xAxisGrid = g.g.selectAll('.x-grid');
        xAxisGrid
            .transition(t)
            .call(xGridCall)
            .selectAll("path")
            .style("stroke", "none");

    }

    function reportWindowSize() {
        drawChart();
    }

    return (
        <div id="chart-area" ref={chartArea}></div>
    )
}