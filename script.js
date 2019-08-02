/* define variables */
let dataUrl = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';
// set margin b/w graph and svg canvas
let margin = {
  top: 100,
  right: 30,
  bottom: 40,
  left: 70
},
  width = 920 - margin.left - margin.right,
  height = 630 - margin.top - margin.bottom;


/* define scales */  
const xScale = d3.scaleLinear().range([0, width]);
const yScale = d3.scaleTime().range([0, height]);
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

/* define Axis generators */
const xAxis = d3.axisBottom(xScale) // returns axis generator with given scale
.tickFormat(d3.format("d")) // format tick numbers as decimal notaion rounded to integer

const formatTime = d3.timeFormat("%M:%S");
const yAxis = d3.axisLeft(yScale)
  .tickFormat(formatTime);


  /* define svg canvas */
  const svg = d3.select('body').append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .attr('class', 'graph') 
  .append('g') // append <g> for graph and translate origin
  .attr('transform', 'translate(' + margin.left +',' + margin.top + ')');
  

  /* define <div> for tooltip and append to the <body> */
  const tip = d3.tip().attr('class', 'd3-tip')
    .attr('id','tooltip')
    .html(d => {
      return (
        `${d.Name}: ${d.Nationality}<br/>
        Year: ${d.Year}, Time: ${d.Time}<br/>
        <p class='doping'>${d.Doping}</p>`
      )
    })
    
    

  svg.call(tip);  
  

d3.json(dataUrl)
  .then(data => {
    
    /* parse Time value (00:00) into Date obj */
    let times = data.map(o => {
      let epoch = new Date(0);
      epoch.setMinutes(o.Time.substring(0,2));
      epoch.setSeconds(o.Time.substring(3,5));
      return epoch
    })
    
    /* set domains for x & y scales */
    const xMin = d3.min(data, d => d.Year - 1), // -1 to make dots not touch y-axis
          xMax = d3.max(data, d => d.Year + 1), // +1 to bring the max dot inside
          yMin = d3.min(times),
          // cb for make dots not touch the bottom axis
          yMax = d3.max(times, time => new Date(time.getTime() + 1e4));

    xScale.domain([xMin, xMax]);
    yScale.domain([yMin, yMax]);
    
    svg.append('g').call(xAxis)
      .attr('id', 'x-axis')
      .attr('transform', 'translate(0,' + height + ')')
    
    svg.append('g').call(yAxis)
      .attr('id', 'y-axis')
    
    svg.append('text')
      .text('Time in Minutes')
      .attr('transform', 'rotate(-90)')
      .attr('x', -120)
      .attr('y', -44)
      .attr('id', 'y-legend');

    svg.selectAll('circle')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('r', 6)
      .attr('cx', d => xScale(d.Year))
      .attr('cy', (d, i) => yScale(times[i]))
      .attr('data-xvalue', d => d.Year)
      .attr('data-yvalue', (d, i) => times[i])
      // ordinal(x): if x is not in scale's domain, x is pushed to the domain, and return corresponding value from the range
      // when you call the scale with the same value, it will return the same value from the range
      .style('fill', d => colorScale(d.Doping != '')) // true(1) or false(0)
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)  
     
      
      /* header text */
      svg.append('text')
        .attr('id', 'title')
        .attr('x', width / 2)
        .attr('text-anchor', 'middle')
        .attr('y', 0 - margin.top / 2 + 5 )
        .style('font-size', '2.2em')
        .style('font-family', 'serif')
        .text('Doping in Professional Bicycle Racing');
  
      svg.append('text')
        .attr('x', width / 2)
        .attr('text-anchor', 'middle')
        .attr('y', -11)
        .style('font-size', '1.3em')
        .style('fill', '#444')
        .text('35 Fastest times up Alpe d\'Huez');

      
      /* legend */
      const legend = svg.selectAll('.legend')
        .data(colorScale.domain()) // [true, false]
        .enter().append('g')
        .attr('id', 'legend')
        .attr('class', 'legend')
        .attr('transform', (d, i) => {
          return `translate(0, ${height/2 - i * 20})`;
        }) // returns selections (array of elements)
      
      // operating on selections  
      legend.append('rect')
        .attr('x', width - 18)
        .attr('height', 18)
        .attr('width', 18)
        .style('fill', colorScale);

      legend.append('text')
        .attr('x', width - 24)
        .attr('text-anchor', 'end')
        .attr('y', 15)
        .text(d => d ? "Riders with doping allegations" :
        "No doping allegations")
        .style('font-size', '12px');
  })
  .catch(err => console.log(err))