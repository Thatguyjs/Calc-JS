// Group tokens and correctly order them

import Err from "./error.mjs";
import Token from "./token.mjs";


class Formatter {
	static precedence = {
		'(': 0,
		'+': 1, '-': 1,
		'*': 2, '/': 2, '%': 2,
		'^': 3,
		'E': 4, '!': 4
	};

	static Expression = 1;
	static Definition = 2;

	tokens = [];
	macros = {};

	constructor(tokens, macros={}) {
		this.tokens = tokens;
		this.macros = macros;
	}

	static get_precedence(token) {
		return Formatter.precedence[token.data];
	}

	static has_precedence(token) {
		return token.data in Formatter.precedence;
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

		else if(token.data === ')' && first_tk.type === Token.Name)
			token_list.unshift(new Token(Token.Operator, '*', { op_type: 'infix' }));

		else if(token.type === Token.Number && first_tk.type === Token.Name)
			token_list.unshift(new Token(Token.Operator, '*', { op_type: 'infix' }));
	}

	// Get the group type (Definition or Expression)
	static get_group_type(group) {
		if(group.tokens.length >= 2 && group.tokens[0].type === Token.Name && group.tokens[1].type === Token.Equals)
			return Formatter.Definition;
		else
			return Formatter.Expression;
	}

	// Correctly order tokens converting from infix to prefix
	order(tokens) {
		let result = [];
		let stack = [new Token(Token.Paren, '(')];
		tokens.push(new Token(Token.Paren, ')'));

		let fn_stack = [];

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

					if(fn_stack.length && fn_stack[0].modifier.depth === depth)
						result.push(fn_stack.shift());
				}
			}
			else if(token.type === Token.Operator) {
				while(stack.length && Formatter.get_precedence(stack[0]) >= Formatter.get_precedence(token)) {
					result.push(stack.shift());
				}
				stack.unshift(token);
			}
			else if(token.type === Token.Name) {
				if(token.data in this.macros) {
					tokens.shift(); // TODO: Error if the next token is not a '('

					let params = []; // List of token paramters
					let param = []; // Current token list parameter
					let depth = 0;

					while(tokens[0] && (tokens[0].data !== ')' || depth > 0)) {
						if(tokens[0].data === '(') depth++;
						else if(tokens[0].data === ')') depth--;

						else if(tokens[0].type === Token.Comma) {
							params.push(param);
							param = [];
							tokens.shift();
						}
						else param.push(tokens.shift());
					}

					tokens.shift();
					if(param.length) params.push(param);

					// TODO: Check the return type so macros can return Err instances
					tokens.unshift(...this.macros[token.data](...params));
				}
				else if(tokens[0] && tokens[0].data === '(') {
					token.modifier.type = 'function';
					fn_stack.unshift(token);
					result.push(tokens[0]); // Mark the start of function parameters
				}
				else {
					token.modifier.type = 'constant';
					result.push(token);
				}
			}
			else if(token.type === Token.Comma) {
				while(stack.length && stack[0].type === Token.Operator) {
					result.push(stack.shift());
				}

				result.push(token);
			}
			else result.push(token);
		}

		if(depth !== -1 || stack.length)
			return { tokens: [], error: new Err(Err.InvalidExpression) };

		return { tokens: result, error: Err.none() };
	}

	group() {
		let groups = [];
		let current = { type: null, tokens: [], error: Err.none() };

		let depth = 0;

		for(let t in this.tokens) {
			if(this.tokens[t].type === Token.Paren) {
				if(this.tokens[t].data === '(') depth++;
				else depth--;
			}

			if(this.tokens[t].type !== Token.Comma || depth > 0)
				current.tokens.push(this.tokens[t]);
			else {
				groups.push(current);
				current = { type: null, tokens: [], error: Err.none() };
			}
		}

		if(current.tokens.length)
			groups.push(current);

		return groups;
	}

	// Group & order all tokens
	all() {
		let groups = this.group();

		for(let g in groups) {
			let ordered = this.order(groups[g].tokens);

			if(ordered.error.has_error()) groups[g].error = ordered.error;
			else groups[g].tokens = ordered.tokens;

			groups[g].type = Formatter.get_group_type(groups[g]);
		}

		return groups;
	}
}


export default Formatter;
