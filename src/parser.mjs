import Err from "./error.mjs";
import Token from "./token.mjs";


// Round a number to an arbitrary precision
function round(number, precision) {
	if(typeof number !== 'number')
		throw new TypeError(`round() expected a number, got a ${typeof number}`);
	if(typeof precision !== 'number')
		throw new TypeError(`round() expected a precision, got a ${typeof precision}`);

	if(number.toString().includes('e')) return number;

	const rounded = +(Math.round(number + 'e' + precision) + 'e-' + precision);
	if(isNaN(rounded)) return number;
	return rounded;
}


class Parser {
	exprs = [];

	constructor(exprs) {
		this.exprs = exprs;
	}

	static operate(op, t1, t2) {
		let value = NaN;

		if(t1.modifier.negative && t1.modifier.depth > op.modifier.depth) {
			t1.data = -t1.data;
			t1.modifier.negative = false;
		}

		switch(op.data) {
			case '+':
				value = round(t1.data + t2.data, 10);
				break;
			case '-':
				value = round(t1.data - t2.data, 10);
				break;
			case '*':
				value = round(t1.data * t2.data, 10);
				break;
			case '/':
				value = round(t1.data / t2.data, 10);
				break;
			case '%':
				value = round(t1.data % t2.data, 10);
				break;
			case '^':
				if(t2.modifier.negative) {
					t2.data = -t2.data;
					t2.modifier.negative = false;
				}
				value = round(t1.data ** t2.data, 10);
				break;
			case 'E':
				if(t2.modifier.negative) {
					t2.data = -t2.data;
					t2.modifier.negative = false;
				}
				value = round(t1.data * (10 ** t2.data), 10);
				break;
		}

		if(t1.modifier.negative || t2.modifier.negative)
			value = -value;

		return new Token(Token.Number, value, { negative: false });
	}

	// Parse the next expression
	next() {
		if(!this.exprs[0]) return null;

		let error = Err.none();
		let num_stack = [];

		while(this.exprs[0].length) {
			const token = this.exprs[0].shift();

			if(token.type === Token.Number) {
				num_stack.unshift(token);
			}
			else {
				let t1 = num_stack.shift();
				let t2 = num_stack.shift();

				num_stack.unshift(Parser.operate(token, t2, t1));
			}
		}

		if(num_stack[0].modifier.negative)
			num_stack[0].data = -num_stack[0].data;

		this.exprs.shift();
		return { value: num_stack[0].data, error };
	}

	// Parse all expressions
	all() {
		let results = [];
		let result = this.next();

		while(result) {
			results.push(result);
			result = this.next();
		}

		return results;
	}
}


export default Parser;
