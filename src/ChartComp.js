import React, { Fragment, useEffect, useRef, useState, useCallback } from "react";
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

    useEffect(() => { //draw chart & initialize g first time
        drawChart();
    }, []);

    useEffect(() => { // update chart when props data is changed
        svg && update(svg);
    }, [props.data]);

    useEffect(() => { // event listener
        window.addEventListener('resize', reportWindowSize);
        return () => {
            window.removeEventListener('resize', reportWindowSize);
        }
    });

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
            .paddingInner(0.3)
            .paddingOuter(0.3);

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
                var val = d?.value || 0;
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

        //set width of bars
        var widthB = Math.min(bar_maxW, xSubgroup.bandwidth());

        //create rounded rectangle path
        var pathGen = (key, yVal) => {
            let w = widthB;
            let x = xSubgroup(key);
            let r = w / 2;
            return rightRoundedRect(x, y(yVal), w, height - y(yVal), r);
        }

        //create & update bars
        var rects = g.g.selectAll('.items').selectAll('path')
            .data(function (d) { return subgroups.map(function (key) { return { key: key, value: d[key] }; }); })

        rects.exit().remove();

        rects
            .enter().append("path")
            .attr("fill", d => color(d.key))
            .merge(rects)
            // .attr("y", y(0))
            .attr("d", function (d) { return pathGen(d.key, 0) })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            .transition(t) /** for rectangles only */
            .attr("transform", function (d) { //puts bars close together
                let def = xSubgroup.bandwidth();
                let x = def > 0 ? (def - bar_maxW) : 0;
                return `translate(${d.key === 'In' ? x : 0},0)`;
            })
            .attr("d", function (d) { return pathGen(d.key, d.value) })
            // .attr("x", function (d) { return xSubgroup(d.key); }) /** for rectangles only */
            // .attr("y", function (d) { return y(d.value); })
            // .attr("width", Math.min(bar_maxW, xSubgroup.bandwidth()))
            // .attr("height", function (d) { return height - y(d.value); })
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

    function rightRoundedRect(x, y, width, height, radius) {
        // round on top left and right
        return "M " + x + "," + y
            + " a " + radius + ",-" + radius + " 0 0 1 " + radius + ",-" + radius
            + " h " + (width - 2 * radius)
            + " a " + radius + "," + radius + " 0 0 1 " + radius + "," + radius
            + " v " + (height)
            + " h -" + width
            + " z";
    }

    function reportWindowSize() {
        drawChart();
    }

    return (
        <div id="chart-area" ref={chartArea}></div>
    )
}