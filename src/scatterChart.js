import * as d3 from 'd3';

export function createScatterChart(selector, data) {
  const width = 500;
  const height = 300;
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };

  const svg = d3
    .select(selector)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const x = d3
    .scaleLinear()
    .domain(d3.extent(data, d => d.x))
    .nice()
    .range([margin.left, width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain(d3.extent(data, d => d.y))
    .nice()
    .range([height - margin.bottom, margin.top]);

  svg
    .append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  svg
    .append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  svg
    .append('g')
    .attr('stroke', 'steelblue')
    .selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', d => x(d.x))
    .attr('cy', d => y(d.y))
    .attr('r', 3);
}
