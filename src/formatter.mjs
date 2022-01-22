// Group tokens and correctly order them

import Err from "./error.mjs";
import Token from "./token.mjs";


class Formatter {
	static precedence = {
		'(': 0,
		'&': 1,
		'|': 2,
		'>': 3, '<': 3,
		'+': 4, '-': 4,
		'*': 5, '/': 5, '%': 5,
		'^': 6,
		'E': 7, '!': 7
	};

	static Expression = 1;
	static Definition = 2;

	tokens = [];
	macros = {};
	end_range = { start: null, end: null };

	constructor(tokens, macros={}) {
		this.tokens = tokens;
		this.macros = macros;

		this.end_range = {
			start: this.tokens[this.tokens.length - 1].modifier.start,
			end: this.tokens[this.tokens.length - 1].modifier.end
		};
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

		const range = {
			start: token.modifier.start,
			end: token.modifier.end
		};

		// Implicit multiplication
		if(token.type === Token.Number && first_tk.data === '(')
			token_list.unshift(new Token(Token.Operator, '*', { op_type: 'infix', ...range }));

		else if(token.data === ')' && first_tk.type === Token.Number)
			token_list.unshift(new Token(Token.Operator, '*', { op_type: 'infix', ...range }));

		else if(token.data === ')' && first_tk.type === Token.Name)
			token_list.unshift(new Token(Token.Operator, '*', { op_type: 'infix', ...range }));

		else if(token.type === Token.Number && first_tk.type === Token.Name)
			token_list.unshift(new Token(Token.Operator, '*', { op_type: 'infix', ...range }));
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
		let stack = [new Token(Token.Paren, '(', { start: 0, end: 0 })];
		tokens.push(new Token(Token.Paren, ')', { start: this.end_range.start + 1, end: this.end_range.end + 1 }));

		let fn_stack = [];

		let last_paren = 0; // Last opening parenthesis "(" index
		let depth = 0;
		let list_depth = 0;

		while(tokens.length) {
			let token = tokens.shift();
			token.modifier.depth = depth;

			// Add implicit tokens
			Formatter.insert_tokens(token, tokens);

			if(token.type === Token.Paren) {
				if(token.data === '(') {
					stack.unshift(token);
					last_paren = token.modifier.start;
					depth++;
				}
				else {
					if(stack[0] && stack[0].data === '(' && stack[0].modifier.type === 'empty')
						return { tokens: [], error: new Err(Err.InvalidExpression, {
							start: last_paren,
							end: token.modifier.end
						}) };

					while(stack.length && stack[0].data !== '(')
						result.push(stack.shift());

					stack.shift();
					depth--;

					if(fn_stack.length && fn_stack[0].modifier.depth === depth)
						result.push(fn_stack.shift());
				}
			}
			else if(token.type === Token.Bracket) {
				if(token.data === '[') {
					stack.unshift(token);
					result.push(token);
					list_depth++;
				}
				else {
					while(stack.length && stack[0].data !== '[')
						result.push(stack.shift());

					stack.shift();
					result.push(token);
					list_depth--;
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
					const macro_res = this.macros[token.data](...params);

					if(macro_res instanceof Err)
						return { tokens: [], error: macro_res };
					else
						tokens.unshift(...macro_res);
				}
				else if(tokens[0] && tokens[0].data === '(') {
					token.modifier.type = 'function';
					fn_stack.unshift(token);

					tokens[0].modifier.type = 'function';
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

		if(depth !== -1 || list_depth !== 0) {
			let range = null;

			if(stack.length) {
				range = {
					start: stack[0].modifier.start,
					end: stack[0].modifier.end
				};
			}
			else if(depth !== -1) {
				range = {
					start: last_paren,
					end: this.end_range.end
				};
			}
			else {
				// TODO: List range
				range = this.end_range;
			}

			return { tokens: [], error: new Err(Err.InvalidExpression, range) };
		}

		return { tokens: result, error: Err.none() };
	}

	group() {
		let groups = [];
		let current = { type: null, tokens: [], error: Err.none() };

		let depth = 0;

		for(let t in this.tokens) {
			if(this.tokens[t].type === Token.Paren || this.tokens[t].type === Token.Bracket) {
				if(this.tokens[t].data === '(' || this.tokens[t].data === '[') depth++;
				else depth--;
			}

			if(depth > 0 || this.tokens[t].type !== Token.Comma)
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
