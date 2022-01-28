var city_json;
var city_totals = [];
const city_chartLength = 8;
var other_days_city = 0;
var city_max_days = 0;
var named_cities = [];
var global_city_chart_HTML = '';
var region_view = 0;
var named_region_cities = [];
var other_days_region_cities = 0;
var max_region_city_days = 0;
var region_name = '';

//get json file, convert to array, and sort
$.ajax({
	type: 'GET',  
	url: 'data/city_totals.json',
	dataType: 'json',       
	success: function(response)  {
		city_json = response;
		for (var i in city_json) {
			city_totals.push([i, city_json[i][0]]);
		}
		city_totals.sort(function(a, b) {
			return b[0] - a[0];
		});
		
		const chart = document.getElementById('city-bar-graph');
		//save these variable for later to control chart
		other_days_city = city_totals.slice(city_chartLength).map(a => a[1]).reduce((a, b) => a + b, 0);
		named_cities = city_totals.slice(0,city_chartLength).map(a => a[0]);
		city_max_days = Math.max.apply(Math, city_totals.map(a => a[1]).concat([other_days_city]));
		
		chart.innerHTML += '<p><strong>Days in each city</strong></p>';
		for (let i = 0; i < city_chartLength; i++) {
			chart.innerHTML += 
				`<p class='bar-labels'>${city_totals[i][0]}: ${city_totals[i][1]}</p>
				<div class='city-bar-area' id=${city_totals[i][0].replace(' ', '_') + '-bar'} style='width:calc((100% - 20px)*${city_totals[i][1]/city_max_days});'>&nbsp;</div>`;
		};
		//add other to chart as well as blank city for future data
		chart.innerHTML += 
			`<p class='bar-labels' id='city-other-label'>Other: ${other_days_city}</p>
			<div class='city-bar-area' id='city-other-bar' style='width:calc((100% - 20px)*${other_days_city/city_max_days});'>&nbsp;</div>
			<p class='bar-labels' id='city-extra-label'>&nbsp;</p>
			<div class='blank-bar-area' id='city-extra-bar'>&nbsp;</div>`;
		global_city_chart_HTML = chart.innerHTML;
		
		//make city table
		var all_days = region_totals.map(a => a[1]).reduce((a, b) => a + b, 0);
		var city_table = `<table style='width:100%'><tr style='background-color:#9abd93;'><th>Rank</th>
			<th>City</th><th>Days</th><th>Percentage</th><tr>`;
		for (var i = 0; i < city_totals.slice(0,-1).length; i++) {
			let color;
			if (!(i % 2)) {
				color = '#ccd4af';
			} else {
				color = '#9abd93';
			}
			city_table += `<tr style='background-color: ${color};'>
				<td class='region-table-text'>${i+1}</td>
				<td class='region-table-text'>${city_totals[i][0]}</td>
				<td class='region-table-text'>${city_totals[i][1]}</td>
				<td class='region-table-text'>${Math.round(10000*city_totals[i][1] / all_days)/100}%</td></tr>`;
		}
		city_table += '</table>';
		document.getElementById('city-table').innerHTML = city_table;
	}   
});

mapboxgl.accessToken = 'pk.eyJ1IjoidGltcHJlZG1vcmUiLCJhIjoiY2t2bHZjeWZqM3FqeTJ1czEybXFmeXIwMCJ9.kFx_gwe3yOCTDhRMXo7f6w';
const city_map = new mapboxgl.Map({
	container: 'city-map',
	style: 'mapbox://styles/timpredmore/ckxaf4e471fv114ppjsnhksra',
	center: [-11.5,18.6],
	zoom: 1.2
});

// wait for map to load before adjusting it
city_map.on('load', () => {
	// make a pointer cursor
	city_map.getCanvas().style.cursor = 'default';
	
	//build legend
	const levels = ['1', '10', '100','1000'];
	const radii = [2,4,8,17];
	const legend = document.getElementById('city-legend');
	levels.forEach((level, i) => {
		const radius = radii[i];
		const item = document.createElement('div');
		
		const key = document.createElement('span');
		key.className = 'city-legend-key';
		key.style.width = `${radius*2}px`;
		key.style.height = `${radius*2}px`;
		key.style.marginLeft = `${17-radius}px`;
		key.style.marginRight = `${22-radius}px`;
		
		const value = document.createElement('span');
		value.innerHTML = `${level}`;
		value.style = `position:absolute; transform: translate(0px,${2+radius}px);`;
		
		item.appendChild(key);
		item.appendChild(value);
		item.style = 'text-align:left;';
		legend.appendChild(item);
	});
	
	//set up default values between mouseovers
	const bars = document.getElementsByClassName('city-bar-area');
	var city_name = '';
	var days = 0;
	
	//build features
	city_map.on('mousemove', (event) => {
		const Cities = city_map.queryRenderedFeatures(event.point, {
			layers: ['Cities']
		});
		
		//set up variables whether it is region or local view
		var current_named_cities = named_cities;
		var current_max_days = city_max_days;
		var current_other_days = other_days_city;
		if (region_view == 1) {
			current_named_cities = named_region_cities;
			current_max_days = max_region_city_days;
			current_other_days = other_days_region_cities;
		} 
		
		//checks if the region exists then gets data				
		if (Cities.length) {		
			//get formatting set up to display days and years
			city_name = Cities[0].properties.city;
			days = Cities[0].properties.days;
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
			
			//actually assign days and years to 'city-pd' tag
			document.getElementById('city-pd').innerHTML = 
				`<h3>${city_name}</h3>
				${daysRow}
				<p style='text-align:center;'><strong><em>${Math.round(Cities[0].properties.prop*10000)/100}</strong>% of Life</em></p>`;
			
			//check to change the
			if (!current_named_cities.includes(city_name) && (days > 0) && (current_other_days > 0)) {
				if (region_view == 0 || (region_view == 1 && city_name.includes(region_name))) {
					//update the other bar and add extra bar
					document.getElementById('city-other-label').outerHTML = 	`<p class='bar-labels' id='city-other-label'>Other: ${current_other_days - days}</p>`;
					document.getElementById('city-other-bar').outerHTML =  `<div class='city-bar-area' id='city-other-bar' style='width:calc((100% - 20px)*${(current_other_days - days)/current_max_days});'>&nbsp;</div>`;
					document.getElementById('city-extra-label').outerHTML = `<p class='bar-labels' id='city-extra-label'>${city_name}: ${days}</p>`;
					document.getElementById('city-extra-bar').outerHTML = `<div class='city-bar-area' id='city-extra-bar' style='width:calc((100% - 20px)*${days/current_max_days}); background-color: #77023f;'>&nbsp;</div>`;
				};
			} else if (current_other_days > 0){
				//set other bar to default
				document.getElementById('city-other-label').outerHTML = 	`<p class='bar-labels' id='city-other-label'>Other: ${current_other_days}</p>`;
				document.getElementById('city-other-bar').outerHTML =  `<div class='city-bar-area' id='city-other-bar' style='width:calc((100% - 20px)*${current_other_days/current_max_days});'>&nbsp;</div>`;
				document.getElementById('city-extra-label').outerHTML = `<p class='bar-labels' id='city-extra-label'>&nbsp;</p>`;
				document.getElementById('city-extra-bar').outerHTML = `<div class='blank-bar-area' id='city-extra-bar'>&nbsp;</div>`;
			}
			
		} else if (current_other_days > 0){
			city_name = '';
			//set features to default and bottom bar to empty
			document.getElementById('city-pd').innerHTML = `<p style='text-align:center;'>Hover over a city to show the duration. Click on a state or country to generate a bar graph of that area. Click the ocean to clear.</p>`;
			document.getElementById('city-other-label').outerHTML = 	`<p class='bar-labels' id='city-other-label'>Other: ${current_other_days}</p>`;
			document.getElementById('city-other-bar').outerHTML =  `<div class='city-bar-area' id='city-other-bar' style='width:calc((100% - 20px)*${current_other_days/current_max_days});'>&nbsp;</div>`;
			document.getElementById('city-extra-label').outerHTML = `<p class='bar-labels' id='city-extra-label'>&nbsp;</p>`;
			document.getElementById('city-extra-bar').outerHTML = `<div class='blank-bar-area' id='city-extra-bar'>&nbsp;</div>`;
		} else {
			city_name = '';
			//set features to default but no other bar exists
			document.getElementById('city-pd').innerHTML = `<p style='text-align:center;'>Hover over a city to show the duration. Click on a state or country to generate a bar graph of that area. Click the ocean to clear.</p>`;
		};
		
		for (var i = 0; i < current_named_cities.length; i++) {
			if (current_named_cities[i] == city_name) {
				bars[i].style.backgroundColor = '#77023f';
			} else {
				bars[i].style.backgroundColor = '#02793d';
			}
		}	
	});	
	//create event listener to generate regional bar graph from click or revert to original bar graph
	city_map.on('click', (event) => {
		const Regions = city_map.queryRenderedFeatures(event.point, {
			layers: ['Regions']
		});
		const chart = document.getElementById('city-bar-graph');
		
		var check_been_there = 0
		if (Regions.length) {
			check_been_there = Regions[0].properties.days;
		}
		
		//create chart for cities within region
		if (check_been_there > 0){
			region_name = Regions[0].properties.name;
			var region_cities = Regions[0].properties.cities;
			var region_cities = region_cities.slice(1,-1).replace(/["]+/g, '').split(',');
			var city_names = region_cities.map(a => a.split(':')[0]);
			var city_durations = region_cities.map(a => parseInt(a.split(':')[1]));
			other_days_region_cities = city_durations.slice(city_chartLength).reduce((a, b) => a + b, 0);
			named_region_cities = city_names.slice(0,city_chartLength).map(a => a + ', ' + region_name);
			max_region_city_days = Math.max.apply(Math, city_durations.concat([other_days_region_cities]));
			
			chart.innerHTML = `<p><strong>Days in each city: ${region_name}</strong></p>`;
			
			for (let i = 0; i < named_region_cities.length; i++) {
				chart.innerHTML += 
					`<p class='bar-labels'>${named_region_cities[i].split(', ')[0]}: ${city_durations[i]}</p>
					<div class='city-bar-area' id=${named_region_cities[i].replace(' ', '_') + '-bar'} 
					style='width:calc((100% - 20px)*${city_durations[i]/max_region_city_days});'>&nbsp;</div>`;
			};
			if (city_names.length > city_chartLength) {
				//add other to chart as well as blank city for future data
				chart.innerHTML += 
					`<p class='bar-labels' id='city-other-label'>Other: ${other_days_region_cities}</p>
					<div class='city-bar-area' id='city-other-bar' style='width:calc((100% - 20px)*${other_days_region_cities/max_region_city_days});'>&nbsp;</div>
					<p class='bar-labels' id='city-extra-label'>&nbsp;</p>
					<div class='blank-bar-area' id='city-extra-bar'>&nbsp;</div>`;
			} else {
				chart.innerHTML += 
					`<p class='bar-labels' id='city-other-label'>&nbsp;</p>
					<div class='city-bar-area' id='city-other-bar' style='display:none;'>&nbsp;</div>
					<p class='bar-labels' id='city-extra-label'>&nbsp;</p>
					<div class='blank-bar-area' id='city-extra-bar'>&nbsp;</div>`;
			}
			region_view = 1;
		} else {
			//revert to original if not in region or ocean clicked
			chart.innerHTML = global_city_chart_HTML;
			region_view = 0;
		};
	});
})



