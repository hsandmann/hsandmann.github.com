$(document).ready(function() {

	var funcs = [
		{
			name: 'Logistic',
			mu  : {
				min : -2,
				max : 4,
				step: 0.002
			},
			y   : {
				min : -0.5,
				max : 1.5,
				step: 0.01
			},
			f: function(mu, x) {
				return x * mu * ( 1 - x );
			},
			derivative: function(mu, x) {
				return mu * (1 - 2 * x);
			}
		},
/*
		{
			name: 'Gauss',
			mu  : {
				min : -1,
				max : 1,
				step: 0.002
			},
			alpha: 4.9,
			y   : {
				min : -1,
				max : 1.5,
				step: 0.01
			},
			f: function(beta, x) {
				return Math.exp(-this.alpha * x^2) + beta;
			},
			derivative: function(mu, x) {
				return mu * (1 - 2 * x);
			}
		},

		{
			name: 'SMap',
			mu  : {
				min : -1,
				max : 1,
				step: 0.002
			},
			y   : {
				min : -10,
				max : 10,
				step: 0.01
			},
			f: function(alpha, x) {
				return alpha * x ^ 3 - alpha * x + x;
			},
			derivative: function(alpha, x) {
				return 3 * alpha * x ^ 2 - alpha + 1;
			}
		},
*/
		{
			name: 'Senoidal',
			mu  : {
				min : -Math.PI,
				max : Math.PI,
				step: 0.002
			},
			y   : {
				min : -Math.PI,
				max : Math.PI,
				step: 0.01
			},
			f: function(mu, x) {
				return mu * Math.sin(Math.PI * x);
			},
			derivative: function(alpha, x) {
				return mu * Math.PI * Math.cos(Math.PI * x);
			}
		},
/*
		{
			name: 'Logistic Kaneko',
			mu  : {
				min : -1,
				max : 1,
				step: 0.002
			},
			y   : {
				min : -1,
				max : 1,
				step: 0.01
			},
			f: function(mu, x) {
				return 1 - mu * x^2;
			},
			derivative: function(alpha, x) {
				return 2 * mu * x;
			}
		}
*/
	];

	var N = 250;
	var sample = 200;
	var x0 = 0.01;
	var mu = 3.2;
	var func = funcs[0];

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

	var graphSinal = {

		element: document.getElementById("canvasSinal"),
		ctx    : function() { return this.element.getContext("2d"); },

		func   : null,

		height : function() { return this.element.height; },
		width  : function() { return this.element.width;  },

		h      : 1,
		w      : 1,
		rh     : 1,
		rw     : 1,

		getX   : function(x) { return this.rw * (x - this.func.mu.min); },
		getY   : function(y) { return this.h - this.rh * (y - this.func.y.min); },

		init   : function(f) {
			this.func = f;
			this.h = this.height();
			this.w = this.width();
			this.rh = this.h / (this.func.y.max - this.func.y.min);
			this.rw = this.w / N;
			this.ctx().clearRect(0, 0, this.w, this.h);

			this.ctx().beginPath();
			this.ctx().moveTo(this.getX(0), this.getY(0));
			this.ctx().lineTo(this.getX(N), this.getY(0));
			this.ctx().strokeStyle = "#0000CC";
			this.ctx().lineWidth = 1;
			this.ctx().stroke();
			this.ctx().closePath();
			this.ctx().beginPath();
		},

		close  : function() {
			this.ctx().strokeStyle = "#FF0000";
			this.ctx().lineWidth = 1;
			this.ctx().stroke();
			this.ctx().closePath();
		},

		plot   : function(n, x) {
			if (n == 0) {
				this.ctx().moveTo(this.getX(n), this.getY(x));
			} else {
				this.ctx().lineTo(this.getX(n), this.getY(x));
			}
		}

	};

	var graphWebDiagram = {

		element: document.getElementById("canvasWebDiagram"),
		ctx    : function() { return this.element.getContext("2d"); },

		func   : null,

		height : function() { return this.element.height; },
		width  : function() { return this.element.width;  },

		h      : 1,
		w      : 1,
		rh     : 1,
		rw     : 1,

		getX   : function(x) { return this.rw * (x - this.func.y.min); },
		getY   : function(y) { return this.h - this.rh * (y - this.func.y.min); },

		init   : function(f, mu) {
			this.func = f;
			this.h = this.height();
			this.w = this.width();
			this.rh = this.h / (this.func.y.max - this.func.y.min);
			this.rw = this.w / (this.func.y.max - this.func.y.min);
			this.ctx().clearRect(0, 0, this.w, this.h);

			this.ctx().beginPath();
			this.ctx().moveTo(this.getX(f.y.min), this.getY(f.f(mu, f.y.min)));
			for (var i = this.func.y.min; i <= this.func.y.max; i += this.func.y.step) {
				this.ctx().lineTo(this.getX(i), this.getY(f.f(mu, i)));
			}
			this.ctx().strokeStyle = "#0000FF";
			this.ctx().lineWidth = 1;
			this.ctx().stroke();
			this.ctx().closePath();

			this.ctx().beginPath();
			this.ctx().moveTo(this.getX(f.y.min), this.getY(f.y.min));
			this.ctx().lineTo(this.getX(f.y.max), this.getY(f.y.max));
			this.ctx().strokeStyle = "#0000CC";
			this.ctx().lineWidth = 1;
			this.ctx().stroke();
			this.ctx().closePath();

			this.ctx().beginPath();
		},

		close  : function() {
			this.ctx().strokeStyle = "#FF0000";
			this.ctx().lineWidth = 1;
			this.ctx().stroke();
			this.ctx().closePath();
		},

		plot   : function(x0, x1) {
			this.ctx().lineTo(this.getX(x0), this.getY(x1));
		}

	};


	var graphBifurcationMap = {

		element: document.getElementById("canvasBifurcationMap"),
		ctx    : function() { return this.element.getContext("2d"); },

		func   : null,

		height : function() { return this.element.height; },
		width  : function() { return this.element.width;  },

		h      : 1,
		w      : 1,
		rh     : 1,
		rw     : 1,

		getX   : function(x) { return this.rw * (x - this.func.mu.min); },
		getY   : function(y) { return this.h - this.rh * (y - this.func.y.min); },

		init   : function(f) {
			this.func = f;
			this.h = this.height();
			this.w = this.width();
			this.rh = this.h / (this.func.y.max - this.func.y.min);
			this.rw = this.w / (this.func.mu.max - this.func.mu.min);
			this.ctx().clearRect(0, 0, this.w, this.h);

			this.ctx().beginPath();
			this.ctx().moveTo(this.getX(this.func.mu.min), this.getY(0));
			this.ctx().lineTo(this.getX(this.func.mu.max), this.getY(0));
			this.ctx().strokeStyle = "#0000CC";
			this.ctx().lineWidth = 1;
			this.ctx().stroke();
			this.ctx().closePath();
		},

		close  : function() {
		},

		plot   : function(mu, x) {
			this.ctx().beginPath();
			this.ctx().fillRect(this.getX(mu), this.getY(x), 1, 1);
			this.ctx().closePath();
		}

	};

	var graphLyapunovMap = {

		element: document.getElementById("canvasLyapunovMap"),
		ctx    : function() { return this.element.getContext("2d"); },

		func   : null,

		height : function() { return this.element.height; },
		width  : function() { return this.element.width;  },

		h      : 1,
		w      : 1,
		rh     : 1,
		rw     : 1,
		getX   : function(x) { return this.rw * (x - this.func.mu.min); },
		getY   : function(y) { return this.h - this.rh * (y - this.minLyap); },


		lyap   : 1,
		nlyap  : 0,

		mu     : 0,
		mapLyap: [],

		minLyap: null,
		maxLyap: null,

		init   : function(f, mu) {
			this.func = f;
			this.mapLyap = [];
			this.minLyap = null;
			this.maxLyap = null;
			this.h = this.height();
			this.w = this.width();
			this.rw = this.w / (this.func.mu.max - this.func.mu.min);
			this.ctx().clearRect(0, 0, this.w, this.h);
		},

		reset  : function(mu) {
			this.mu = mu;
			this.lyap = 1;
			this.nlyap = 0;
			this.last = null;
		},

		add    : function(v) {

			this.lyap *= this.func.derivative(this.mu, v);
			this.nlyap++;
		},

		calc    : function() {
			var l = Math.log(this.lyap) / this.nlyap;
			if (isNaN(l) || !isFinite(l)) {
				return;
			}
			if (this.minLyap === null || l < this.minLyap) {
				this.minLyap = l;
			}
			if (this.maxLyap === null || l > this.maxLyap) {
				this.maxLyap = l;
			}
			this.mapLyap[this.mu] = l;
		},

		close   : function() {

			this.rh = this.h / (this.maxLyap - this.minLyap);

			this.ctx().beginPath();
			this.ctx().moveTo(this.getX(this.func.mu.min), this.getY(0));
			this.ctx().lineTo(this.getX(this.func.mu.max), this.getY(0));
			this.ctx().strokeStyle = "#0000CC";
			this.ctx().lineWidth = 1;
			this.ctx().stroke();
			this.ctx().closePath();

			for (var i = this.func.mu.min; i <= this.func.mu.max; i += this.func.mu.step) {
				var l = this.mapLyap[i];
				if (!l) {
					continue;
				}
				this.ctx().beginPath();
				this.ctx().fillRect(this.getX(i), this.getY(l), 1, 1);
				this.ctx().closePath();
			}
//			console.log('(' + this.mu + ', ' + l + ')');
		}

	};

	function drawGlobal(f) {

		graphBifurcationMap.init(f);
		graphLyapunovMap.init(f);

		for (var mu = f.mu.min; mu <= f.mu.max; mu += f.mu.step) {
			var x = x0;
			graphLyapunovMap.reset(mu);
			for (var n = 0; n <= N; n++) {
				if (n >= (N - sample)) {
					graphBifurcationMap.plot(mu, x);
					graphLyapunovMap.add(x);
				}
				x = f.f(mu, x);
			}
			graphLyapunovMap.calc();
		}

		graphBifurcationMap.close();
		graphLyapunovMap.close();

		draw(f, mu, x);

	}

	function draw(f, mu, x) {

		graphSinal.init(f);
		graphWebDiagram.init(f, mu);

		for (var n = 0; n <= N; n++) {
			graphSinal.plot(n, x);
			var nx = f.f(mu, x);
			if (n >= (N - sample)) {
				graphWebDiagram.plot(x, nx);
			}
			x = nx;
		}

		graphSinal.close();
		graphWebDiagram.close();

	}

	function init() {
		$.each(funcs, function(i, f) {
			$('#listFunctions').append($('<option>', {
				value: i,
				text : f.name
			}));
		});

		$('#listFunctions').on('change', function(){
			func = funcs[$(this).val()];
			drawGlobal(func);
		});

		drawGlobal(funcs[$('#listFunctions').val()]);
	}

	init();

});
