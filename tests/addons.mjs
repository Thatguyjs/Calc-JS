// Constants and functions for the calculator

import { Token, Err } from "../src/include.mjs";


// Allow functions to take token input
function tk_wrap(call) {
	return function(...tokens) {
		let nums = [];

		for(let t in tokens) {
			if(tokens[t].modifier.negative) {
				tokens[t].data = -tokens[t].data;
				tokens[t].modifier.negative = false;
			}

			nums.push(tokens[t].data);
		}

		const result = call(...nums);

		if(isNaN(result)) {
			const last_tk = tokens[tokens.length - 1];

			const location = {
				start: tokens[0]?.modifier?.start ?? null,
				end: last_tk?.modifier?.end ?? null
			};

			return new Err(Err.Other, "Invalid Value", location);
		}
		else return new Token(Token.Number, result);
	}
}


export default {
	constants: {
		"pi": Math.PI,
		"e": Math.E
	},

	functions: {
		abs: tk_wrap(Math.abs),

		sin: tk_wrap(Math.sin),
		cos: tk_wrap(Math.cos),
		tan: tk_wrap(Math.tan),

		sqrt: tk_wrap(Math.sqrt),
		cbrt: tk_wrap(Math.cbrt),

		floor: tk_wrap(Math.floor),
		round: tk_wrap(Math.round),
		ceil: tk_wrap(Math.ceil),

		sum: tk_wrap((...nums) => {
			let total = 0;

			for(let n in nums)
				total += nums[n];

			return total;
		})
	},

	macros: {
		def: (name, value) => {
			if(name.length > 1 && name[1].data === 'as') {
				value = name.slice(2);
				name = [name[0]];
			}
			else if(!value)
				return new Err(Err.Other, "Missing Macro Parameters");

			return [name[0], new Token(Token.Equals, '='), ...value];
		}
	}
};
