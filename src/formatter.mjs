// Group tokens and correctly order them

import Token from "./token.mjs";


class Formatter {
	static precedence = {
		'(': 0,
		'+': 1, '-': 1,
		'*': 2, '/': 2, '%': 2,
		'^': 3,
		'E': 4
	};

	tokens = [];

	constructor(tokens) {
		this.tokens = tokens;
	}

	static get_precedence(token) {
		return Formatter.precedence[token.data];
	}

	// Correctly order tokens using infix to prefix
	static order(tokens) {
		let result = [];
		let stack = [new Token(Token.Paren, '(')];
		tokens.push(new Token(Token.Paren, ')'));

		while(tokens.length) {
			let token = tokens.shift();

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
				while(stack.length && Formatter.get_precedence(stack[0]) >= Formatter.get_precedence[token]) {
					result.push(stack.shift());
				}
				stack.unshift(token);
			}
			else result.push(token);
		}

		return result;
	}

	group() {
		let groups = [];
		let current = [];

		for(let t in this.tokens) {
			if(this.tokens[t].type !== Token.Comma)
				current.push(this.tokens[t]);
			else {
				groups.push(current);
				current = [];
			}
		}

		if(current.length)
			groups.push(current);

		return groups;
	}

	// Group & order the tokens
	all() {
		let groups = this.group();

		for(let g in groups)
			groups[g] = Formatter.order(groups[g]);

		return groups;
	}
}


export default Formatter;
