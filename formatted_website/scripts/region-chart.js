var region_json;
var region_totals = [];
const chartLength = 8;
var other_days_region = 0;
var max_days = 0;
var named_regions = [];

//get json file, convert to array, and sort
$.ajax({
	type: 'GET',  
	url: 'data/region_totals.json',
	dataType: 'json',       
	success: function(response)  {
		region_json = response;
		for (var i in region_json) {
			region_totals.push([i, region_json[i][0]]);
		}
		region_totals.sort(function(a, b) {
			return b[0] - a[0];
		});
		
		const chart = document.getElementById('region-bar-graph');
		//save these variable for later to control chart
		max_days = Math.max.apply(Math, region_totals.map(a => a[1]));
		other_days_region = region_totals.slice(chartLength).map(a => a[1]).reduce((a, b) => a + b, 0);
		named_regions = region_totals.slice(0,chartLength).map(a => a[0]);
		
		
		chart.innerHTML += '<p><strong>Days in each country or state</strong></p>';
		for (let i = 0; i < chartLength; i++) {
			chart.innerHTML += 
				`<p class='bar-labels'>${region_totals[i][0]}: ${region_totals[i][1]}</p>
				<div class='region-bar-area' id=${region_totals[i][0].replace(' ', '_') + '-bar'} style='width:calc((100% - 20px)*${region_totals[i][1]/max_days});'>&nbsp;</div>`;
		};
		//add "other" bar to chart as well as blank area for future data
		chart.innerHTML += 
			`<p class='bar-labels' id='region-other-label'>Other: ${other_days_region}</p>
			<div class='region-bar-area' id='region-other-bar' style='width:calc((100% - 20px)*${other_days_region/max_days});'>&nbsp;</div>
			<p class='bar-labels' id='region-extra-label'>&nbsp;</p>
			<div class='blank-bar-area' id='region-extra-bar'>&nbsp;</div>`;
		
		//make region table
		var all_days = region_totals.map(a => a[1]).reduce((a, b) => a + b, 0);
		var region_table = `<table style='width:100%'><tr style='background-color:#c98e95;'><th>Rank</th>
			<th>State or Country</th><th>Days</th><th>Percentage</th><tr>`;
		for (var i = 0; i < region_totals.slice(0,-1).length; i++) {
			let color;
			if (i % 2) {
				color = '#c98e95';
			} else {
				color = '#e4bcb1';
			}
			region_table += `<tr style='background-color: ${color};'>
				<td class='region-table-text'>${i+1}</td>
				<td class='region-table-text'>${region_totals[i][0]}</td>
				<td class='region-table-text'>${region_totals[i][1]}</td>
				<td class='region-table-text'>${Math.round(10000*region_totals[i][1] / all_days)/100}%</td></tr>`;
		}
		region_table += '</table>';
		document.getElementById('region-table').innerHTML = region_table;
	}   
});

mapboxgl.accessToken = 'pk.eyJ1IjoidGltcHJlZG1vcmUiLCJhIjoiY2t2bHZjeWZqM3FqeTJ1czEybXFmeXIwMCJ9.kFx_gwe3yOCTDhRMXo7f6w';
const map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/timpredmore/ckvyfxii56m1214m601ggr2c7',
	center: [-11.5,18.6],
	zoom: 1.2
});
// wait for map to load before adjusting it
map.on('load', () => {
	// make a pointer cursor
	map.getCanvas().style.cursor = 'default';

	// create legend
	const levels = ['0', '1', '10','100', '500', '1500', '2500'];
	const colors = ['#838684', '#ffebcc', '#e4bcb1', '#c98e95', '#ae5f78', '#93315c', '#77023f'];
	const legend = document.getElementById('region-legend');
	levels.forEach((level, i) => {
		const color = colors[i];
		const item = document.createElement('div');
		const key = document.createElement('span');
		key.className = 'region-legend-key';
		key.style.backgroundColor = color;
		 
		const value = document.createElement('span');
		value.innerHTML = `${level}`;
		item.appendChild(key);
		item.appendChild(value);
		legend.appendChild(item);
	});

	//establish some necessary variables globally 
	const bars = document.getElementsByClassName('region-bar-area');
	var region_name = '';
	var days = 0;

	//create inset event listener and update bar graph
	map.on('mousemove', (event) => {
		const Regions = map.queryRenderedFeatures(event.point, {
			layers: ['Regions']
		});

		//checks if the region exists then gets data				
		if (Regions.length) {					
			//get formatting set up to display days and years
			region_name = Regions[0].properties.name;
			days = Regions[0].properties.days;
			let years = Math.floor(days/365);
			let remainderDays = days - years*365;
			let yearsWord = (years == 1)
				? 'Year'
				: 'Years';	
			let daysWord = (remainderDays == 1)
				? 'Day'
				: 'Days';
			let daysRow = (years < 1)
				? `<p style='text-align:center;'><em><strong>${remainderDays}</strong> ${daysWord}</em></p>`
				: `<p style='text-align:center;'><em><strong>${years}</strong> ${yearsWord}<strong>, ${remainderDays}</strong> ${daysWord}</em></p>`;

			//actually assign days and years to 'pd' tag
			document.getElementById('pd').innerHTML = 
				`<h3>${region_name}</h3>
				${daysRow}
				<p style='text-align:center;'><strong><em>${Math.round(Regions[0].properties.prop*10000)/100}</strong>% of Life</em></p>`;
			
			if (!named_regions.includes(region_name) && (days > 0)) {
				//update the other bar and add extra bar
				document.getElementById('region-other-label').outerHTML = 	`<p class='bar-labels' id='region-other-label'>Other: ${other_days_region - days}</p>`;
				document.getElementById('region-other-bar').outerHTML =  `<div class='region-bar-area' id='region-other-bar' style='width:calc((100% - 20px)*${(other_days_region - days)/max_days});'>&nbsp;</div>`;
				document.getElementById('region-extra-label').outerHTML = `<p class='bar-labels' id='region-extra-label'>${region_name}: ${days}</p>`;
				document.getElementById('region-extra-bar').outerHTML = `<div class='region-bar-area' id='region-extra-bar' style='width:calc((100% - 20px)*${days/max_days}); background-color: #77023f;'>&nbsp;</div>`;
			} else{
				document.getElementById('region-other-label').outerHTML = 	`<p class='bar-labels' id='region-other-label'>Other: ${other_days_region}</p>`;
				document.getElementById('region-other-bar').outerHTML =  `<div class='region-bar-area' id='region-other-bar' style='width:calc((100% - 20px)*${other_days_region/max_days});'>&nbsp;</div>`;
				document.getElementById('region-extra-label').outerHTML = `<p class='bar-labels' id='region-extra-label'>&nbsp;</p>`;
				document.getElementById('region-extra-bar').outerHTML = `<div class='blank-bar-area' id='region-extra-bar'>&nbsp;</div>`;
			}
			
		} else {
			region_name = '';
			//set features area to default and bottom bar to empty
			//document.getElementById('pd').innerHTML = `<p style='text-align:center;'>Hover over a state or country to show the duration. Also you can zoom if you want.</p>`;
			document.getElementById('region-other-label').outerHTML = 	`<p class='bar-labels' id='region-other-label'>Other: ${other_days_region}</p>`;
			document.getElementById('region-other-bar').outerHTML =  `<div class='region-bar-area' id='region-other-bar' style='width:calc((100% - 20px)*${other_days_region/max_days});'>&nbsp;</div>`;
			document.getElementById('region-extra-label').outerHTML = `<p class='bar-labels' id='region-extra-label'>&nbsp;</p>`;
			document.getElementById('region-extra-bar').outerHTML = `<div class='blank-bar-area' id='region-extra-bar'>&nbsp;</div>`;
		};
		
		for (var i = 0; i < named_regions.length; i++) {
			if (named_regions[i] == region_name) {
				bars[i].style.backgroundColor = '#77023f';
			} else {
				bars[i].style.backgroundColor = '#02793d';
			}
		}							
	});
});

