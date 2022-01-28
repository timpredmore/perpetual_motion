let canvas = document.getElementById('line-graph-canvas');
let context = canvas.getContext('2d');
let line_graph_init_places = [
	'Carlisle, Pennsylvania', 
	'Garmisch-Partenkirchen, Germany', 
	'Springfield, Virginia',
	'Bethlehem, Pennsylvania',
	'Yerevan, Armenia',
	'Frankfurt, Germany',
	'Skopje, North Macedonia',
	'Columbus, Ohio',
	'Los Angeles, California',
	'Las Vegas, Nevada',
	'Springfield, Ohio',
	'Monterey, California'
];
let line_graph_data = [];
var life_log = [];
let formatted_dataset = [];
let all_labels = [];
let line_colors = [
	'#f78129', 
	'#02793d', 
	'#77023f', 
	'#693b25', 
	'#2c24d0', 
	'#f12bdf', 
	'#e9f12b',  
	'#f12b39', 
	'#93f12b', 
	'#24d0ba',
	'#98fb98',
	'#aa0202',
	'#838684'
];
let line_graph = '';
let current_places = line_graph_init_places;
let unused_line_colors = ['#808000', '#6495ed'];
var line_places_array = [];
let cumulativePlaceCount = function() {};
let updateLeaderBar = function() {};

/*load in data and process*/
$.ajax({
	type: 'GET',  
	url: 'data/current_clean_json.json',
	dataType: 'json',       
	success: function(response)  {
		life_log = response;
		let life_log_len = Object.keys(life_log).length;
		line_graph_data = Array.from({length: line_graph_init_places.length + 1}, e => Array(life_log_len).fill(0));
		all_labels = new Array(life_log_len).fill(0);
		let formatted_labels = []
		for (var i = 0; i < life_log_len; i++) {
			all_labels[i] = life_log[i][0];
			if (all_labels[i].slice(-2,100) == '01') {
				formatted_labels.push(all_labels[i])
			};
		};

		//function to get cumulative days by place from life_log
		cumulativePlaceCount = function(input_named_places) {
			temp_place_idx = ''
			let temp_line_graph_data = Array.from({length: input_named_places.length + 1}, e => Array(life_log_len).fill(0));
			for (var i = 0; i < life_log_len; i++) {
				if (input_named_places.includes(life_log[i][3])) {
					temp_place_idx = input_named_places.indexOf(life_log[i][3]);
					temp_line_graph_data[temp_place_idx][i] = 1;
				} else {
					temp_line_graph_data.at(-1)[i] = 1;
				};
			};

			for (var i = 0; i < temp_line_graph_data.length; i++) { //
				for (var j = 1; j < life_log_len; j++) { //
					temp_line_graph_data[i][j] = temp_line_graph_data[i][j-1] + temp_line_graph_data[i][j];
				};
			};

			let temp_formatted_data = Array.from({length: temp_line_graph_data.length}, e => Array(0));
			for (var i = 0; i < life_log_len; i++) {
				if (all_labels[i].slice(-2,100) == '01') {
					for (var j=0; j < temp_line_graph_data.length; j++) {
						temp_formatted_data[j].push(temp_line_graph_data[j][i])
					};
				};
			};
			return [temp_line_graph_data, temp_formatted_data];
		};

		//function to calculate leader from line_graph_data
		updateLeaderBar = function(temp_line_graph_data, input_places) {
			console.log(input_places);
			let leader_list = [];
			let leader_count = 0;
			let leader_place = -1;
			for (var i = 0; i < life_log_len; i++) {
				let max_val = 0;
				let max_place = '';
				for (var j = 0; j < temp_line_graph_data.length; j++){
					if (temp_line_graph_data[j][i] > max_val) {
						max_val = temp_line_graph_data[j][i];
						max_place = input_places[j];
					};
				};

				let day_arr = temp_line_graph_data.map(a => a[i])
				let leader_current = day_arr.indexOf(day_arr.reduce((a,b) => Math.max(a,b)))
				if (leader_current == leader_place || max_val == 0) {
					leader_count += 1;
				} else {
					leader_list.push([leader_place,leader_count]);
					leader_place = leader_current;
					leader_count = 1;
				};
			};
			leader_list.push([leader_place,leader_count]);
			//leader_list = leader_list.slice(1);
			let leader_bar = document.getElementById('leader-bar');
			leader_bar.innerHTML = "<p style='font-size:12px; color:#77023f; margin:10px; margin-right:17px; margin-top:12px'><strong>Leader</strong></p>";
			for (var i=0; i<leader_list.length; i++) {
				leader_bar.innerHTML += `<div style='background-color: ${line_colors.at(leader_list[i][0])}; margin-top: 10px; height:20px; width:calc((100% - 85px)*${leader_list[i][1]/life_log_len})'></div>`;
			};
			console.log(leader_list);
		};

		let cumulative_results = cumulativePlaceCount(line_graph_init_places);
		line_graph_data = cumulative_results[0];
		formatted_data = cumulative_results[1];
		updateLeaderBar(line_graph_data.slice(0,-1), line_graph_init_places);

		//format data to chart.js dataset format
		line_graph_init_places.push('Other')
		for (var i = 0; i < formatted_data.length; i++) {
			formatted_dataset.push({
				label: line_graph_init_places[i],
				data: formatted_data[i],
				borderColor: line_colors[i],
				backgroundColor: line_colors[i]
			});
		};

		//add legend elements
		let line_graph_legend = document.getElementById('line-graph-legend');
		for (var i = 0; i < line_colors.length; i++) {
			if (i < line_colors.length - 1) {
				line_graph_legend.innerHTML += 
					`<div class='line-graph-legend-label' onclick='removeLineGraphSeries(this)'>
						<div class='place-bar-legend-key' style='background-color:${line_colors[i]};'></div>
						${line_graph_init_places[i]}
					</div>`;	
			} else {
				line_graph_legend.innerHTML +=
					`<div class='line-graph-legend-label-static' id='line-other-label'>
						<div class='place-bar-legend-key' style='background-color:${line_colors[i]};'></div>
						${line_graph_init_places[i]}
					</div>`;
			}
		};

		//add input 
		line_graph_legend.innerHTML += 
			`<div class='line-graph-legend-label-static' id='line-graph-input-label'>
				<div class='place-bar-legend-key' style='background-color:#000000;'></div>
				<input id='line-graph-input' list='line-graph-input-list' type='text' oninput='updateLineGraph()' style='width:80%'>
				<datalist id='line-graph-input-list'></datalist>
			</div>`;
		line_places_array = Object.values(life_log).map(a => a[3]);
		line_places_array = new Set(line_places_array);
		line_places_array = Array.from(line_places_array).sort();
		let line_graph_input_list = document.getElementById('line-graph-input-list');
		for (var i=0; i < line_places_array.length; i++) {
			line_graph_input_list.innerHTML += `<option value='${line_places_array[i]}'/>`
		};

		current_places.pop();//removes Other

		/*create line chart*/
		line_graph = new Chart(context, {
			type: 'line',
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
					display: false
					},
					decimation: {
						enabled: true
					}
				},
				elements: {
                    point:{
                        radius: 0
                    }
				},
				scales: {
					x: {
						ticks: {
							callback: function(val, index) {
							  	return (formatted_labels[index].slice(-5) == '01-01') ? formatted_labels[index].slice(0,4) : null;
							},
							color: '#77023f'
						},
						grid: {
							borderColor: '#331100'
						}
					},
					y: {
						grid: {
							borderColor: '#331100' 
						},
						title: {
							display: true,
							text: 'Cumulative Days',
							color: '#77023f'
						},
						ticks: {
							color: '#77023f'
						}
					}
				}
			},
			data: {
				labels: formatted_labels,
				datasets: formatted_dataset
			}
		});
	}
});

let removeLineGraphSeries = function(item) {
	let input_place = item.textContent.trim();
	let remove_idx = current_places.indexOf(input_place);
	let remove_series = line_graph.data.datasets.at(remove_idx)['data'];
	let other_series = line_graph.data.datasets.at(-1)['data'];
	unused_line_colors.push(line_graph.data.datasets.at(remove_idx)['borderColor']);
	line_colors.splice(remove_idx, 1);
	for (var i=0; i<other_series.length; i++) {
		other_series[i] = other_series[i] + remove_series[i];
	};
	line_graph.data.datasets.splice(remove_idx, 1);
	line_graph.update();
	item.remove();
	current_places.splice(remove_idx, 1);

	let new_series = cumulativePlaceCount(current_places);
	updateLeaderBar(new_series[0].slice(0,-1), current_places);
	$('#line-graph-input-label').show();
};

let updateLineGraph = function() {
	let input_place = document.getElementById('line-graph-input').value;
	if (line_places_array.includes(input_place) && !current_places.includes(input_place)) {
		if (unused_line_colors.length) {
			document.getElementById('line-other-label').insertAdjacentHTML('beforebegin',
				`<div class='line-graph-legend-label' onclick='removeLineGraphSeries(this)'>
					<div class='place-bar-legend-key' style='background-color:${unused_line_colors[0]};'></div>
				${input_place}</div>`
			);
			current_places.push(input_place);
			line_colors.splice(-1, 0, unused_line_colors[0]);
			let new_series = cumulativePlaceCount(current_places);
			updateLeaderBar(new_series[0].slice(0,-1), current_places)
			line_graph.data.datasets.pop()
			line_graph.data.datasets.push({
				label: input_place,
				data: new_series[1].at(-2),
				borderColor: unused_line_colors[0],
				backgroundColor: unused_line_colors[0]
			});
			line_graph.data.datasets.push({
				label: 'Other',
				data: new_series[1].at(-1),
				borderColor: '#838684',
				backgroundColor: '#838684'
			});
			line_graph.update();
			unused_line_colors = unused_line_colors.slice(1,100);
			if (!unused_line_colors.length) {
				$('#line-graph-input-label').hide();
			};
			document.getElementById('line-graph-input').value = null;
		};
	}; 
};
