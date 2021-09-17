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

	// Insert tokens if they were implicitly used
	static insert_tokens(token, token_list) {
		const first_tk = token_list[0];
		if(!first_tk) return;

		// Implicit multiplication
		if(token.type === Token.Number && first_tk.data === '(')
			token_list.unshift(new Token(Token.Operator, '*', { op_type: 'infix' }));

		else if(token.data === ')' && first_tk.type === Token.Number)
			token_list.unshift(new Token(Token.Operator, '*', { op_type: 'infix' }));

		else if(token.type === Token.Number && first_tk.type === Token.Name)
			token_list.unshift(new Token(Token.Operator, '*', { op_type: 'infix' }));
	}

	// Correctly order tokens converting from infix to prefix
	static order(tokens) {
		let result = [];
		let stack = [new Token(Token.Paren, '(')];
		tokens.push(new Token(Token.Paren, ')'));

		let depth = 0;

		while(tokens.length) {
			let token = tokens.shift();
			token.modifier.depth = depth;

			// Add implicit tokens
			Formatter.insert_tokens(token, tokens);

			if(token.type === Token.Paren) {
				if(token.data === '(') {
					stack.unshift(token);
					depth++;
				}
				else {
					while(stack.length && stack[0].data !== '(') {
						result.push(stack.shift());
					}

					stack.shift();
					depth--;
				}
			}
			else if(token.type === Token.Operator) {
				while(stack.length && Formatter.get_precedence(stack[0]) >= Formatter.get_precedence(token)) {
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

	// Group & order all tokens
	all() {
		let groups = this.group();

		for(let g in groups)
			groups[g] = Formatter.order(groups[g]);

		return groups;
	}
}


export default Formatter;
