import Token from "./token.mjs";


class Expr {
	static precedence = {
		'(': 0,
		'+': 1, '-': 1,
		'*': 2, '/': 2, '%': 2,
		'^': 3,
		'!': 4
	};

	tokens = [];
	reordered = false;

	constructor(tokens=[]) {
		this.tokens = tokens;
	}

	static from_tokens(tokens, split_on) {
		if(!Array.isArray(tokens)) throw new TypeError(`Expected \`tokens\` to be an Array, got ${typeof tokens} instead`);

		let exprs = [];
		let expr_tokens = [];

		for(let t in tokens) {
			if(tokens[t].type === split_on) {
				exprs.push(expr_tokens);
				expr_tokens = [];
			}
			else expr_tokens.push(tokens[t].shift());
		}

		if(expr_tokens.length) exprs.push(expr_tokens);
		return exprs;
	}

	// Re-order tokens to follow the order of operations (article here: https://algotree.org/algorithms/stack_based/infix_to_postfix/)
	reorder() {
		if(this.reordered) return false;

		let result = [];
		let stack = [new Token('(')];
		this.tokens.push(new Token(')'));

		while(this.tokens.length) {
			let token = this.tokens.shift();

			if(token.type === Token.Paren) {
				if(token.data === '(') {
					stack.unshift(token);
				}
				else {
					while(stack[0].data !== '(') {
						let tk = stack.shift();
						result.push(tk);
					}

					stack.shift();
				}
			}
			else if(token.type === Token.Operator) {
				while(stack.length && Expr.precedence[stack[0].data] >= Expr.precedence[token.data]) {
					let tk = stack.shift();
					result.push(tk);
				}

				stack.unshift(token);
			}
			else {
				result.push(token);
			}
		}

		this.tokens = result;
		this.reordered = true;
		return true;
	}
}


export default Expr;
