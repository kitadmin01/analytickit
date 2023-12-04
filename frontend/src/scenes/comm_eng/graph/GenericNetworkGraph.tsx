import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './CryptoDashboard.scss'; // Import the SCSS file


const GenericNetworkGraph = ({ tokenFlow, mostActiveTokenAddresses, title, width, height }) => {
      const d3Container = useRef(null);

    useEffect(() => {
        if (tokenFlow && mostActiveTokenAddresses && d3Container.current) {
            const nodes = new Set();
            const links = [];

            // Extract nodes and links for token flow
            tokenFlow.forEach(flow => {
                nodes.add(flow.from);
                nodes.add(flow.to);
                links.push({ source: flow.from, target: flow.to, value: parseFloat(flow.value) });
            });

            const nodeData = Array.from(nodes).map(node => ({
                id: node,
                activity: mostActiveTokenAddresses[node] || 0
            }));

            // Set up D3 graph here
            const svg = d3.select(d3Container.current);
            svg.selectAll("*").remove(); // Clear svg content before adding new elements

            // Create D3 force simulation
            const simulation = d3.forceSimulation(nodeData)
                .force("link", d3.forceLink(links).id(d => d.id))
                .force("charge", d3.forceManyBody())
                .force("center", d3.forceCenter(100, 100));

            // Add lines for every link in the dataset
            const link = svg.append("g")
                .attr("class", "links")
                .selectAll("line")
                .data(links)
                .enter().append("line")
                .style("stroke", "#aaa");

            // Add labels for each link
            const linkText = svg.append("g")
                .attr("class", "link-labels")
                .selectAll("text")
                .data(links)
                .enter().append("text")
                .text(d => d.value)
                .style("fill", "#555")
                .style("font-size", 10);

            // Add circles for every node in the dataset
            const node = svg.append("g")
                .attr("class", "nodes")
                .selectAll("circle")
                .data(nodeData)
                .enter().append("circle")
                .attr("r", 5) // Radius of node
                .style("fill", d => d.activity > 0 ? "red" : "blue");

            // Add labels for each node
            const nodeText = svg.append("g")
                .attr("class", "node-labels")
                .selectAll("text")
                .data(nodeData)
                .enter().append("text")
                .text(d => d.id)
                .style("fill", "#333")
                .style("font-size", 10)
                .attr("dx", 12)
                .attr("dy", ".35em");

            // Add graph title
            svg.append("text")
                .attr("x", width / 3)
                .attr("y", width/8)
                .attr("text-anchor", "middle")
                .style("font-size", "10px")
                .text(title);

            // Update positions each tick
            simulation.on("tick", () => {
                link
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);

                node
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);

                nodeText
                    .attr("x", d => d.x)
                    .attr("y", d => d.y);

                linkText
                    .attr("x", d => (d.source.x + d.target.x) / 2)
                    .attr("y", d => (d.source.y + d.target.y) / 2);
                  
            });
        }
    }, [tokenFlow, mostActiveTokenAddresses, title, width, height]);

    return (
      <div className="network-container"> {/* Use the class name from your SCSS */}
        <svg
            className="network-container "
            width={width}
            height={height}
            ref={d3Container}
        />
      </div>
    );
};

export default GenericNetworkGraph;
