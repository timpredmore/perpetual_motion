mapboxgl.accessToken = 'pk.eyJ1IjoidGltcHJlZG1vcmUiLCJhIjoiY2t2bHZjeWZqM3FqeTJ1czEybXFmeXIwMCJ9.kFx_gwe3yOCTDhRMXo7f6w';
const line_map = new mapboxgl.Map({
	container: 'line-map',
	style: 'mapbox://styles/timpredmore/ckyad6bbo5w6v14o9845lki1f',
	center: [-11.5,18.6],
	zoom: 1.2
});

// wait for map to load before adjusting it
line_map.on('load', () => {
	// make a pointer cursor
	line_map.getCanvas().style.cursor = 'default';
	
	// add legend
	var legend_HTML = '';
	legend_HTML += "<p style='text-align:center; padding:0px; margin:0px; margin-bottom:5px;'>Newest</p>"
	legend_HTML += "<div style='width:40px; height:80px; background-image: linear-gradient(#f78129, #838684, #93315c); margin:auto;'>&nbsp;</div>"
	legend_HTML += "<p style='text-align:center; padding:0px; margin: 0px; margin-top:5px;'>Oldest</p>"
	document.getElementById('line-legend').innerHTML = legend_HTML;
	
	line_map.on('mousemove', (event) => {
		const lines = line_map.queryRenderedFeatures(event.point, {
			layers: ['Lines']
		});

		//checks if the region exists then gets data				
		if (lines.length) {					
			//get formatting set up to display days and years
			region_name = lines[0].properties.name;
			var line_feature_HTML = `<p><strong>Start: </strong>${lines[0].properties.start_loc}</p>`;
			line_feature_HTML += `<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${lines[0].properties.start_date}</p>`;
			line_feature_HTML += `<p><strong>End:   </strong>${lines[0].properties.end_loc}</p>`;
			line_feature_HTML += `<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${lines[0].properties.end_date}</p>`;
			document.getElementById('line-features').innerHTML = line_feature_HTML;
		}
	});
	
});

//set up so starting values can be added
let sliderOne = document.getElementById("slider-1");
let sliderTwo = document.getElementById("slider-2");
let displayValOne = document.getElementById("range1");
let displayValTwo = document.getElementById("range2");
let sliderMaxValue = 0;

function fillColor(){
    percent1 = (sliderOne.value / sliderMaxValue) * 100;
    percent2 = (sliderTwo.value / sliderMaxValue) * 100;
    sliderTrack.style.background = `linear-gradient(to right, #ffebcc ${percent1}% , #67a776 ${percent1}% , #67a776 ${percent2}%, #ffebcc ${percent2}%)`;
}

//load lifelog -------------------------------------------------
var life_log = [];
$.ajax({
	type: 'GET',  
	url: 'data/current_clean_json.json',
	dataType: 'json',       
	success: function(response)  {
		life_log = response;
		//use life_log to get values of slider
		sliderMaxValue = Object.keys(life_log).length - 1;
		sliderOne.max = sliderMaxValue;
		sliderTwo.max = sliderMaxValue;
		sliderOne.value = 0;
		sliderTwo.value = sliderMaxValue;
		displayValOne.textContent = life_log[sliderOne.value][0];
		displayValTwo.textContent = life_log[sliderTwo.value][0];
		fillColor();
	}
});
		
let minGap = 365;
let sliderTrack = document.querySelector(".slider-track");
let display_value = '';

function slideOne(){
    if(parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap){
        sliderOne.value = parseInt(sliderTwo.value) - minGap;
    }
	line_map.setFilter('Lines', ['all', ['>=', ['get', 'time_int'], parseInt(sliderOne.value)], 
		['<=', ['get', 'time_int'], parseInt(sliderTwo.value)]]);
	line_map.setFilter('Points', ['all', ['>=', ['get', 'time_int'], parseInt(sliderOne.value)], 
		['<=', ['get', 'time_int'], parseInt(sliderTwo.value)]]);
	display_value = life_log[parseInt(sliderOne.value)][0];
    displayValOne.textContent = display_value;
    fillColor();
}
function slideTwo(){
    if(parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap){
        sliderTwo.value = parseInt(sliderOne.value) + minGap;
    }
	line_map.setFilter('Lines', ['all', ['>=', ['get', 'time_int'], parseInt(sliderOne.value)], 
		['<=', ['get', 'time_int'], parseInt(sliderTwo.value)]]);
	line_map.setFilter('Points', ['all', ['>=', ['get', 'time_int'], parseInt(sliderOne.value)], 
		['<=', ['get', 'time_int'], parseInt(sliderTwo.value)]]);
	display_value = life_log[parseInt(sliderTwo.value)][0];
    displayValTwo.textContent = display_value;
    fillColor();
}
