// Constants and functions for the calculator


// Allow functions to take token input
function tk_wrap(call) {
	return function(token) {
		return call(token.data);
	}
}


export default {
	constants: {
		"pi": Math.PI,
		"e": Math.E
	},

	functions: {
		sin: tk_wrap(Math.sin),
		cos: tk_wrap(Math.cos),
		tan: tk_wrap(Math.tan),
		sqrt: tk_wrap(Math.sqrt),
		cbrt: tk_wrap(Math.cbrt),
		floor: tk_wrap(Math.floor),
		round: tk_wrap(Math.round),
		ceil: tk_wrap(Math.ceil)
	}
};
