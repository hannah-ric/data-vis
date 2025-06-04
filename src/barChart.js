import * as d3 from 'd3';

export function createBarChart(selector, data, { width, height } = {}) {
  const container = d3.select(selector);
  width = width || container.node().clientWidth || 500;
  height = height || container.node().clientHeight || 300;
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };

  const svg = container
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const x = d3
    .scaleBand()
    .domain(data.map(d => d.label))
    .range([margin.left, width - margin.right])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  svg
    .append('g')
    .attr('fill', 'steelblue')
    .selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', d => x(d.label))
    .attr('y', d => y(d.value))
    .attr('height', d => y(0) - y(d.value))
    .attr('width', x.bandwidth());

  svg
    .append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  svg
    .append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));
}
