$(document).ready(function() {

	var illustrationFunctions = [
		lorenz,
		rossler,
//		tinkerbell
	];

	var N = 250;
	var sample = 200;
	var x0 = 0.01;
	var mu = 3.2;
	var func = changeFunction(illustrationFunctions[0]);

	var data = null;
	var graph = null;

/*
	$('#x0').on('input change', function(){
		x0 = (parseInt($(this).val()) * (func.y.max - func.y.min)) / 100 + func.y.min;
//		console.log("mu: " + mu + " , x0 = " + x0);
		draw(func, mu, x0);
	});

	$('#mu').on('input change', function(){
		mu = (parseInt($(this).val()) * (func.mu.max - func.mu.min)) / 100 + func.mu.min;
//		console.log("mu: " + mu + " , x0 = " + x0);
		draw(func, mu, x0);
	});

*/

	function init() {
		$.each(illustrationFunctions, function(i, f) {
			$('#listFunctions').append($('<option>', {
				value: i,
				text : f.name
			}));
		});

		$('#listFunctions').on('change', function(){
			changeFunction(illustrationFunctions[$(this).val()]);
		});
	}

	function changeFunction(f) {
		func = f;
		var t = $("<table/>");
		$.each(func.params, function(i, p) {
			t.append($("<tr/>")
				.append($("<td/>")
					.html(p)
					.addClass('right')
				).append($("<td/>").append(
					$("<input/>")
					.attr("data-param", p)
					.val(func[p])
					.addClass('right')
				)));
		});
		$("#parameters").empty().append(t);

		var label = ['x', 'y', 'z'];
		var t = $("<table/>");
		$.each(func.init, function(i, v) {
			t.append($("<tr/>")
				.append($("<td/>")
					.html(label[i])
					.addClass('right')
				).append($("<td/>").append(
					$("<input/>")
					.attr("data-initial-index", i)
					.val(v)
					.addClass('right')
				)));
		});
		$("#initials").empty().append(t);

		$("#n").val(func.N);
		$("#step").val(func.step);

		plot();
	}

	function plot() {
		// Create and populate a data table.
		data = new vis.DataSet();

		// create some nice looking data with sin/cos
		var ode = new ODE(func);
		var d = func.init;

		for (var i = 0; i <= func.N/func.step; i++) {
			data.add({x: d[0], y: d[1], z: d[2]});
			d = ode.rk4(d, func.step);
		}
		
		// specify options
		var options = {
			width:  '600px',
			height: '600px',
			style: 'line',
			showPerspective: false,
			showGrid: true,
			keepAspectRatio: true,
			verticalRatio: 1.0
		};

		// create our graph
		var container = document.getElementById('mygraph');
		graph = new vis.Graph3d(container, data, options);

		graph.setCameraPosition(0.4, undefined, undefined);
	}




	init();

});
