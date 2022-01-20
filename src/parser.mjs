import Err from "./error.mjs";
import Token from "./token.mjs";
import Formatter from "./formatter.mjs";


// Round a number to an arbitrary precision
function round(number, precision) {
	if(Array.isArray(number))
		return number.map(tk => round(tk.data, precision));

	if(typeof number !== 'number')
		throw new TypeError(`round() expected a number, got ${typeof number}`);
	if(typeof precision !== 'number')
		throw new TypeError(`round() expected a precision, got ${typeof precision}`);


	if(number.toString().includes('e')) return number;

	const rounded = +(Math.round(number + 'e' + precision) + 'e-' + precision);
	if(isNaN(rounded)) return number;
	return rounded;
}


class Parser {
	exprs = [];
	constants = {};
	variables = {};
	functions = {};

	constructor(exprs, constants={}, functions={}) {
		this.exprs = exprs;
		this.constants = constants;
		this.functions = functions;

		// Make sure variable definitions are first
		let defs = [];
		let ind = 0;

		while(ind < this.exprs.length) {
			if(this.exprs[ind].type === Formatter.Definition)
				defs.push(this.exprs.splice(ind, 1)[0]);
			else ind++;
		}

		this.exprs = defs.concat(this.exprs);
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

		if(op === undefined || t1 === undefined || t2 === undefined)
			return { token: null, error: new Err(Err.InvalidOperation) };

		// Apply negatives if needed
		if(t1.modifier.negative && t1.modifier.depth > op.modifier.depth) {
			t1.data = -t1.data;
			t1.modifier.negative = false;
		}
		else if(t1.modifier.negative && Formatter.get_precedence(op) <= Formatter.precedence['*']) {
			t1.data = -t1.data;
			t1.modifier.negative = false;
		}

		if(t2.modifier.negative) {
			t2.data = -t2.data;
			t2.modifier.negative = false;
		}

		// Perform the operation
		switch(op.data) {
			case '&':
				value = t1.data & t2.data;
				break;
			case '|':
				value = t1.data | t2.data;
				break;
			case '>':
				value = t1.data > t2.data ? 1 : 0;
				break;
			case '<':
				value = t1.data < t2.data ? 1 : 0;
				break;
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
				value = round(t1.data ** t2.data, 10);
				break;
			case 'E':
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

		// Remaining negatives
		if(t1.modifier.negative)
			value = -value;

		return { token: new Token(Token.Number, value, { negative: false }), error: Err.none() };
	}

	static list_operate(op, t1, t2) {
		let result = [];

		if(t1.type === Token.List && t2.type === Token.List) {
			if(t1.data.length !== t2.data.length) return { token: null, error: new Err(Err.InvalidOperation) };

			for(let i = 0; i < t1.data.length; i++) {
				if(t1.modifier.negative) t1.data[i].modifier.negative = !t1.data[i].modifier.negative;
				if(t2.modifier.negative) t2.data[i].modifier.negative = !t2.data[i].modifier.negative;

				const op_res = Parser.operate(op, t1.data[i], t2.data[i]);

				if(op_res.error.has_error()) return op_res;
				result.push(op_res.token);
			}
		}
		else if(t1.type === Token.List) {
			for(let t in t1.data) {
				if(t1.modifier.negative) t1.data[t].modifier.negative = !t1.data[t].modifier.negative;

				const op_res = Parser.operate(op, t1.data[t], t2);

				if(op_res.error.has_error()) return op_res;
				result.push(op_res.token);
			}
		}
		else {
			for(let t in t2.data) {
				if(t2.modifier.negative) t2.data[t].modifier.negative = !t2.data[t].modifier.negative;

				const op_res = Parser.operate(op, t1, t2.data[t]);

				if(op_res.error.has_error()) return op_res;
				result.push(op_res.token);
			}
		}

		return { token: new Token(Token.List, result, { negative: false }), error: Err.none() };
	}


	// Parse the next expression
	next() {
		if(!this.exprs[0]) return null;
		if(this.exprs[0].error.has_error())
			return { value: 0, error: this.exprs.shift().error };

		const expr = this.exprs.shift();

		let var_name = "";
		if(expr.type === Formatter.Definition) {
			var_name = expr.tokens[0].data;
			expr.tokens = expr.tokens.slice(2);
		}

		let error = Err.none();
		let num_stack = [];

		while(expr.tokens.length) {
			const token = expr.tokens.shift();

			if(token.type === Token.Number) {
				num_stack.unshift(token);
			}
			else if(token.type === Token.Name) {
				if(token.modifier.type === 'constant') {
					if(token.data in this.constants)
						num_stack.unshift(new Token(Token.Number, this.constants[token.data]));
					else if(token.data in this.variables)
						num_stack.unshift(new Token(Token.Number, this.variables[token.data]));
					else {
						error = new Err(Err.UnknownVariable);
						break;
					}
				}
				else if(token.modifier.type === 'function') {
					if(token.data in this.functions) {
						let params = [];

						while(num_stack.length && num_stack[0].type !== Token.Paren)
							params.unshift(num_stack.shift());

						// TODO: Return an error here if `num_stack.length === 0`

						num_stack.shift();
						num_stack.unshift(...this.functions[token.data](...params));
					}
					else {
						error = new Err(Err.UnknownFunction);
						break;
					}
				}
			}
			else if(token.type === Token.Operator) {
				if(token.modifier.op_type === 'infix') {
					let t1 = num_stack.shift();
					let t2 = num_stack.shift();
					let res = null;

					if(t1.type !== Token.List && t2.type !== Token.List)
						res = Parser.operate(token, t2, t1);
					else
						res = Parser.list_operate(token, t2, t1);

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

			// Lists
			else if(token.type === Token.Bracket) {
				if(token.data === '[') num_stack.unshift(token);
				else {
					let items = [];

					while(num_stack.length && num_stack[0].type !== Token.Bracket)
						items.unshift(num_stack.shift());

					let negative = num_stack[0].modifier.negative;

					// Replace first element
					num_stack[0] = new Token(Token.List, items, { negative });
				}
			}

			// Function parameters
			else if(token.type === Token.Paren) {
				num_stack.unshift(token);
			}
			else if(token.type === Token.Comma) continue;

			// A weird token appeared
			else return { value: 0, error: new Err(Err.UnknownToken) };
		}

		if(error.has_error())
			return { value: 0, error };

		if(!num_stack.length && expr.type !== Formatter.Definition)
			return { type: Parser.Expression, value: 0, error: new Err(Err.InvalidExpression) };

		if(num_stack[0].type === Token.List) {
			for(let t in num_stack[0].data) {
				if(num_stack[0].modifier.negative ^ num_stack[0].data[t].modifier.negative)
					num_stack[0].data[t].data = -num_stack[0].data[t].data;
			}

			num_stack[0].modifier.negative = false;
		}

		if(!error.has_error() && num_stack[0].modifier.negative)
			num_stack[0].data = -num_stack[0].data;

		if(expr.type === Formatter.Definition)
			return { type: expr.type, variable: var_name, value: round(num_stack[0].data, 10), error: Err.none() };
		else
			return { type: expr.type, value: round(num_stack[0].data, 10), error };
	}

	// Parse all expressions
	all() {
		let results = [];
		let result = this.next();

		while(result) {
			if(result.type === Formatter.Definition)
				this.variables[result.variable] = result.value;
			else
				results.push(result);

			result = this.next();
		}

		return results;
	}
}


export default Parser;
