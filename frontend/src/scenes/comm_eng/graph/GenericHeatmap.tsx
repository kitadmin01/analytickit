import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const GenericHeatmap = ({ data, xLabels, yLabels, title }) => {
   const d3Container = useRef(null);

  // Function to transform the data into the required format
  const transformData = (data, xLabels, yLabels) => {
    let transformed = [];
    for (let i = 0; i < xLabels.length; i++) {
      for (let j = 0; j < yLabels.length; j++) {
        transformed.push({
          group: xLabels[i],
          variable: yLabels[j],
          value: data[i][j]
        });
      }
    }
    return transformed;
  };

  useEffect(() => {
    if (data && d3Container.current) {
      const transformedData = transformData(data, xLabels, yLabels);

      // Normalizing data
      const maxValuesByVariable = {};
      yLabels.forEach(label => {
        maxValuesByVariable[label] = d3.max(transformedData, d => d.variable === label ? d.value : 0);
      });

      transformedData.forEach(d => {
        d.normalizedValue = d.value / maxValuesByVariable[d.variable];
      });

      const margin = { top: 50, right: 30, bottom: 50, left: 100 };
      const width = 450 - margin.left - margin.right;
      const height = 450 - margin.top - margin.bottom;

      d3.select(d3Container.current).selectAll("*").remove();

      const svg = d3.select(d3Container.current)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const x = d3.scaleBand()
        .range([0, width])
        .domain(xLabels)
        .padding(0.05);
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
          .attr("transform", "rotate(-45)")
          .style("text-anchor", "end");

      const y = d3.scaleBand()
        .range([height, 0])
        .domain(yLabels)
        .padding(0.05);
      svg.append("g")
        .call(d3.axisLeft(y));

      // Logarithmic color scale
      const myColor = d3.scaleSequential()
        .interpolator(d3.interpolateInferno)
        .domain([0, 1]); // Normalized values

      // Append title to the SVG
      svg.append("text")
      .attr("x", width / 2)
      .attr("y", 0 - margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text(title);

      svg.selectAll()
        .data(transformedData)
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(d.group); })
        .attr("y", function(d) { return y(d.variable); })
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", function(d) { return myColor(Math.log(d.normalizedValue + 1)); }); // Adding 1 to avoid log(0)
    }
  }, [data, xLabels, yLabels, title]);

  return (
    <div ref={d3Container} />
  );
};

export default GenericHeatmap;
