import Token from "./token.mjs";
import Lexer from "./lexer.mjs";
import Err from "./error.mjs";


class Parser {
	expr = [];
	result = { error: Err.none(), value: null };

	constructor(expr) {
		this.expr = expr;
		this.expr.reorder();
	}

	execute() {
		this.result.error = 0;
		let res_stack = [];

		while(this.expr.tokens.length) {
			const token = this.expr.tokens.shift();

			if(token.type === Token.Number) {
				res_stack.unshift(+token.data);
			}
			else {
				let n1 = res_stack.shift();
				let n2 = res_stack.shift();

				switch(token.data) {
					case '+':
						res_stack.unshift(n2 + n1);
						break;

					case '-':
						res_stack.unshift(n2 - n1);
						break;

					case '*':
						res_stack.unshift(n2 * n1);
						break;

					case '/':
						res_stack.unshift(n2 / n1);
						break;

					case '%':
						res_stack.unshift(n2 % n1);
						break;

					case '^':
						res_stack.unshift(n2 ** n1);
						break;

					case 'E':
						res_stack.unshift(n2 * (10 ** n1));
						break;
				}
			}
		}

		this.result.value = res_stack[0];
		return this.result;
	}
}


export default Parser;
