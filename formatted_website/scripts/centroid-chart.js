mapboxgl.accessToken = 'pk.eyJ1IjoidGltcHJlZG1vcmUiLCJhIjoiY2t2bHZjeWZqM3FqeTJ1czEybXFmeXIwMCJ9.kFx_gwe3yOCTDhRMXo7f6w';
const centroid_map = new mapboxgl.Map({
	container: 'centroid-map',
	style: 'mapbox://styles/timpredmore/ckydec1p74gcz14o11e0wwld6',
	center: [-55,40],
	zoom: 2.5
});

var blank_centroid_chart = `<div id='centroid-title;' style='width: 280px; border-right:1px #331100 solid;'>
								<p style='margin-top:30px; text-align:center'><strong>Cumulative life centroid by day</strong></p>
							</div>
							<div id='centroid-loc' style='width:350px;'>
								<p style='margin-left:30px; margin-top:17px;'>Centroid latitude: </p>
								<p style='margin-left:30px;'>Centroid longitude:</p>
							</div>
							<div id='centroid-other-info'>
								<p style='margin-left:30px; margin-top:17px;'>Date:</p>
								<p style='margin-left:30px;'>Location:</p>
							</div>`;


centroid_map.on('load', () => {
	// make a pointer cursor
	centroid_map.getCanvas().style.cursor = 'default';
	
	// add legend
	var legend_HTML =  "<p style='text-align:center; padding:0px; margin:0px; margin-bottom:5px;'>Newest</p>";
	legend_HTML += "<div style='width:40px; height:80px; background-image: linear-gradient(#f78129, #838684, #93315c); margin:auto;'>&nbsp;</div>";
	legend_HTML += "<p style='text-align:center; padding:0px; margin: 0px; margin-top:5px;'>Oldest</p>";
	document.getElementById('centroid-legend').innerHTML = legend_HTML;
	
	//add blank chart HTML
	document.getElementById('centroid-chart').innerHTML = blank_centroid_chart;
	
	centroid_map.on('mousemove', (event) => {
		const centroids = centroid_map.queryRenderedFeatures(event.point, {
			layers: ['Centroids']
		});
		if (centroids.length) {
			let full_centroid_chart = `<div id='centroid-title;' style='width: 280px; border-right:1px #331100 solid;'>
								<p style='margin-top:30px; text-align:center'><strong>Cumulative life centroid by day</strong></p>
							</div>
							<div id='centroid-loc' style=' width:350px;'>
								<p style='margin-left:30px; margin-top:17px;'>Centroid latitude: &nbsp;&nbsp;&nbsp; ${centroids[0].geometry.coordinates[1].toFixed(8)}</p>
								<p style='margin-left:30px;'>Centroid longitude: ${centroids[0].geometry.coordinates[0].toFixed(8)}</p>
							</div>
							<div id='centroid-other-info'>
								<p style='margin-left:30px; margin-top:17px;'>Date: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${centroids[0].properties.date.slice(0,10).replaceAll('/','-')}</p>
								<p style='margin-left:30px;'>Location: ${centroids[0].properties.city}</p>
							</div>`;
			
			document.getElementById('centroid-chart').innerHTML = full_centroid_chart;	
			console.log(centroids.length);
		} else {
			document.getElementById('centroid-chart').innerHTML = blank_centroid_chart;
		};
	});
});