import Err from "./error.mjs";
import Token from "./token.mjs";


class Parser {
	exprs = [];

	constructor(exprs) {
		this.exprs = exprs;
	}

	static operate(op, t1, t2) {
		let value = NaN;

		switch(op) {
			case '+':
				value = t1.data + t2.data;
				break;
			case '-':
				value = t1.data - t2.data;
				break;
			case '*':
				value = t1.data * t2.data;
				break;
			case '/':
				value = t1.data / t2.data;
				break;
			case '%':
				value = t1.data % t2.data;
				break;
			case '^':
				if(t2.modifier.negative) {
					t2.data = -t2.data;
					t2.modifier.negative = false;
				}
				value = t1.data ** t2.data;
				break;
			case 'E':
				if(t2.modifier.negative) {
					t2.data = -t2.data;
					t2.modifier.negative = false;
				}
				value = t1.data * (10 ** t2.data);
				break;
		}

		if(t1.modifier.negative || t2.modifier.negative)
			value = -value;

		return new Token(Token.Number, value, { negative: false });
	}

	// Parse the next expression
	next() {
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

				num_stack.unshift(Parser.operate(token.data, t2, t1));
			}
		}

		if(num_stack[0].modifier.negative)
			num_stack[0].data = -num_stack[0].data;

		return { value: num_stack[0].data, error };
	}
}


export default Parser;
