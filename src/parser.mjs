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
	constants = {};
	functions = {};

	constructor(exprs, constants={}, functions={}) {
		this.exprs = exprs;
		this.constants = constants;
		this.functions = functions;
	}

	add_constant(name, value, override=false) {
		if(name in this.constants && !override) return false;

		this.constants[name] = value;
		return true;
	}

	add_function(name, callback, override=false) {
		if(name in this.functions && !override) return false;

		this.functions[name] = callback;
		return true;
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
			case '!':
				if(t1.data < 0) {
					return { token: null, error: new Err(Err.InvalidOperation) };
				}
				value = t1.data;
				while(--t1.data > 1) value *= t1.data;
				break;
		}

		if(t1.modifier.negative || t2.modifier.negative)
			value = -value;

		return { token: new Token(Token.Number, value, { negative: false }), error: Err.none() };
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
			else if(token.type === Token.Name) {
				if(token.modifier.type === 'constant') {
					if(token.data in this.constants)
						num_stack.unshift(new Token(Token.Number, this.constants[token.data]));
					else {
						error = new Err(Err.UnknownVariable);
						break;
					}
				}
				else if(token.modifier.type === 'function') {
					if(token.data in this.functions)
						num_stack.unshift(new Token(Token.Number, this.functions[token.data](num_stack.shift())));
					else {
						error = new Err(Err.UnknownFunction);
						break;
					}
				}
			}
			else {
				if(token.modifier.op_type === 'infix') {
					let t1 = num_stack.shift();
					let t2 = num_stack.shift();
					let res = Parser.operate(token, t2, t1);

					if(res.error.has_error())
						return { value: 0, error: res.error };

					num_stack.unshift(res.token);
				}
				else if(token.modifier.op_type === 'postfix') {
					let res = Parser.operate(token, num_stack.shift(), new Token(Token.None));

					if(res.error.has_error())
						return { value: 0, error: res.error };

					num_stack.unshift(res.token);
				}
			}
		}

		if(!error.has_error() && num_stack[0].modifier.negative)
			num_stack[0].data = -num_stack[0].data;

		this.exprs.shift();

		if(error.has_error()) return { value: 0, error };
		else return { value: round(num_stack[0].data, 10), error };
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
