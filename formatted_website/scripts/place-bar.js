let place_bar = document.getElementById('place-bar');
var stay_log = [];
let places_array = [];
let place_bar_colors = ['#f78129', '#02793d', '#77023f', '#693b25', '#2c24d0', '#f12bdf', '#e9f12b',  '#f12b39', '#93f12b', '#24d0ba', '#98fb98', '#aa0202', '#808000', '#6495ed']
let place_bar_init_places = ['Carlisle, Pennsylvania', 
							'Garmisch-Partenkirchen, Germany', 
							'Springfield, Virginia',
							'Bethlehem, Pennsylvania',
							'Yerevan, Armenia',
							'Frankfurt, Germany',
							'Skopje, North Macedonia',
							'Columbus, Ohio',
							'Los Angeles, California',
							'Las Vegas, Nevada']
let place_bar_legend = document.getElementById('place-bar-legend');
let unused_place_bar_colors = place_bar_colors.slice(place_bar_init_places.length,100);
let current_legend_places = [];



$.ajax({
	type: 'GET',  
	url: 'data/current_stays.json',
	dataType: 'json',       
	success: function(response)  {
		stay_log = response;
		let stay_log_len = Object.keys(stay_log).length;
		let total_len = Object.values(stay_log).map(a => a[1]).reduce((a, b) => a + b, 0);
		for (let i = 0; i < stay_log_len; i++) {
			let place_name = stay_log[i][0].replaceAll(' ', '_').split(',_');	
			place_bar.innerHTML += `<div id='sliver-${i}' class='sliver ${place_name[1]} ${place_name[0]}__${place_name[1]}' style='width:${(100*stay_log[i][1])/total_len}%;'></div>`
		};
		
		//get list of unique cities and regions
		places_array = Object.values(stay_log).map(a => a[0]);
		places_array = places_array.concat(places_array.map(a => a.split(', ')[1]));
		places_array = new Set(places_array);
		places_array = Array.from(places_array).sort();
		
		//create place-bar drop-down options
		let place_bar_input_list = document.getElementById('place-bar-input-list')
		for (let i = 0; i < places_array.length; i++) {
			place_bar_input_list.innerHTML += `<option value='${places_array[i]}'/>`
		}
		
		//add legend elements
		for (var i = 0; i < place_bar_init_places.length; i++) {
			place_bar_legend.innerHTML += `<span class='place-bar-legend-label' onclick='removePlaceBarValue(this)'>
				<div class='place-bar-legend-key' style='background-color:${place_bar_colors[i]};'></div>
				${place_bar_init_places[i]}</span>`
			let input_place = place_bar_init_places[i].replaceAll(' ','_').split(',_');
			$(`.sliver.${input_place[1]}.${input_place[0]}__${input_place[1]}`).css('backgroundColor', place_bar_colors[i]);
		};
		current_legend_places = current_legend_places.concat(place_bar_init_places);
	}
});

let changeColor = function(input_place, to_color) {
	input_place = input_place.trim().replaceAll(' ','_').split(',_')
	if (input_place.length == 2) {
		$(`.sliver.${input_place[1]}.${input_place[0]}__${input_place[1]}`).css('backgroundColor', to_color);
	} else {
		$(`.sliver.${input_place[0]}`).css('backgroundColor', to_color);
	};
}

let updateBar = function() {
	let input_place = document.getElementById('place-bar-input').value;
	if (places_array.includes(input_place) && !current_legend_places.includes(input_place)) {
		if (unused_place_bar_colors.length) {
			place_bar_legend.innerHTML += `<span class='place-bar-legend-label' onclick='removePlaceBarValue(this)'>
				<div class='place-bar-legend-key' style='background-color:${unused_place_bar_colors[0]};'></div>
				${input_place}</span>`;
			current_legend_places.push(input_place);
			changeColor(input_place, unused_place_bar_colors[0]);
			unused_place_bar_colors = unused_place_bar_colors.slice(1,100);
			document.getElementById('place-bar-warning').innerHTML = '';
		} else {
			document.getElementById('place-bar-warning').innerHTML = 'Limit reached.';
		};
		document.getElementById('place-bar-input').value = '';
	}; 
};

let clearPlaceBar = function() {
	$('.sliver').css('backgroundColor', '#838684');
	place_bar_legend.innerHTML = '';
	unused_place_bar_colors = place_bar_colors;
	current_legend_places = [];
	document.getElementById('place-bar-warning').innerHTML = '';
};

let removePlaceBarValue = function(item) {
	//change color of object being removed
	let input_place = item.textContent.trim();
	current_legend_places.splice(current_legend_places.indexOf(input_place), 1)
	let color = item.getElementsByClassName('place-bar-legend-key')[0].style.backgroundColor;
	item.remove();
	changeColor(input_place, '#838684');
	unused_place_bar_colors.push(color)
	document.getElementById('place-bar-warning').innerHTML = '';
	
	//change color of all objects
	let labels = document.getElementsByClassName('place-bar-legend-label');
	for (let i = 0; i < labels.length; i++) {
		input_place = labels[i].textContent;
		color = labels[i].getElementsByClassName('place-bar-legend-key')[0].style.backgroundColor;
		changeColor(input_place, color);
	}
}