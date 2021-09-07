import Token from "./token.mjs";
import Err from "./error.mjs";


class Expr {
	static precedence = {
		prefix: {
			'-': 2
		},
		infix: {
			'+': 1, '-': 1,
			'*': 2, '/': 2, '%': 2,
			'^': 3,
			'E': 4
		},
		postfix: {
			'!': 4
		},
		other: {
			'(': 0
		}
	};

	tokens = [];
	reordered = false;
	error = Err.none();

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

	static get_precedence(token) {
		switch(token.modifier) {
			case Token.mod.op.Prefix:
				return Expr.precedence.prefix[token.data];

			case Token.mod.op.Infix:
				return Expr.precedence.infix[token.data];

			case Token.mod.op.Postfix:
				return Expr.precedence.postfix[token.data];

			default:
				return Expr.precedence.other[token.data];
		}
	}

	// Correct prefix operators
	correct_prefix() {
		let result = [];

		while(this.tokens.length) {
			let token = this.tokens.shift();

			if(token.type === Token.Operator && token.modifier === Token.mod.op.Prefix) {
				result.push(
					new Token('('),
					new Token('0'),
					new Token('-', new Token('0')),
					this.tokens.shift(),
					new Token(')')
				);
			}
			else result.push(token);
		}

		this.tokens = result;
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
						result.push(stack.shift());
					}

					stack.shift();
				}
			}
			else if(token.type === Token.Operator) {
				while(stack.length && Expr.get_precedence(stack[0]) >= Expr.get_precedence(token)) {
					result.push(stack.shift());
				}

				stack.unshift(token);
			}
			else result.push(token);
		}

		this.tokens = result;
		this.reordered = true;
		return true;
	}
}


export default Expr;
