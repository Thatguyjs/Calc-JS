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
		this.result.error = Err.none();
		let res_stack = [];

		while(this.expr.tokens.length) {
			const token = this.expr.tokens.shift();

			if(token.error.has_error()) {
				this.result.error = token.error;
				return this.result;
			}

			if(token.type === Token.Number) {
				res_stack.unshift(+token.data);
			}
			else {
				if(token.modifier === Token.mod.op.Infix) {
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
				else if(token.modifier === Token.mod.op.Postfix) {
					let num = res_stack.shift();

					switch(token.data) {
						case '!':
							if(num < 0) {
								this.result.error = new Err(Err.InvalidOperation);
								return this.result;
							}

							for(let i = num - 1; i > 0; i--) {
								num *= i;
							}

							res_stack.unshift(num);
							break;
					}
				}
			}
		}

		this.result.value = res_stack[0];
		return this.result;
	}
}


export default Parser;
