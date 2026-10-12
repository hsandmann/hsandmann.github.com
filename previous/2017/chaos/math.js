
function ODE(f) {

	this.f = f;

	this.euler = function(y, h) {
		var k = this.f.ode(y);
		return [ y[0]+h*k[0], y[1]+h*k[1] ];
	},

	this.rk4 = function(y, h) {

		var l = y.length;

		// K0 term
		var k0 = this.f.ode(y);

		// K1 term
		var k1 = [];
		for (var i = 0; i < l; i++) {
			k1[i] = y[i]+0.5*h*k0[i];
		}
		var k1 = this.f.ode(k1);

		// K2 term
		var k2 = [];
		for (var i = 0; i < l; i++) {
			k2[i] = y[i]+0.5*h*k1[i];
		}
		var k2 = this.f.ode(k2);

		// K3 term
		var k3 = [];
		for (var i = 0; i < l; i++) {
			k3[i] = y[i]+    h*k2[i];
		}
		var k3 = this.f.ode(k3);

		// Result
		var v = [];
		for (var i = 0; i < l; i++) {
			v[i] = y[i]+h/6*(k0[i]+2*(k1[i]+k2[i])+k3[i]);
		}
		return v;

	}

}

var lorenz = {

	name  : 'Lorenz',
	params: ['rho', 'sigma', 'beta'],

	N     : 100,
	step  : 0.005,

	init  : [ 1, 1, 1 ],

	rho   : 28,
	sigma : 10,
	beta  : 8/3,

	ode   : function(d) {
		var x = d[0];
		var y = d[1];
		var z = d[2];

		var dx = this.sigma * (y - x);
		var dy = x * (this.rho - z) - y;
		var dz = x * y - this.beta * z;
		return [dx, dy, dz];
	}

}

var rossler = {

	name  : 'Rossler',
	params: ['a', 'b', 'c'],

	N     : 200,
	step  : 0.01,

	init  : [ 1, 1, 1 ],

	a: 0.2,
	b: 0.2,
	c: 5.7,

	ode: function(d) {
		var x = d[0];
		var y = d[1];
		var z = d[2];

		var dx = -y -z;
		var dy = x + this.a * y;
		var dz = this.b + z * (x - this.c);
		return [dx, dy, dz];
	}

}

var tinkerbell = {

	name: 'Tinkerbell',
	params: ['a', 'b', 'c', 'd'],
	
	N     : 300,
	step  : 0.005,

	init  : [ 1, 1, 1 ],

	a: 0.9,
	b: -0.6013,
	c: 2.0,
	d: 0.50,

	ode: function(d) {
		var x = d[0];
		var y = d[1];

		var x = x^2 - y^2 + this.a*x + this.b*y;
		var y = 2*x*y + this.c*x + this.d*y;
		return [x, y];
	}

}

// https://en.wikipedia.org/wiki/Kuramoto_model
var kuramoto = {

	name : 'Kuramoto',
	omega: 0.1,

	ode  : function() {
	}

}

var bifurcationFunctions = {

}

var oscillatorFunctions = [

	kuramoto

]
