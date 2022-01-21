import Err from "./error.mjs";
import Token from "./token.mjs";


class Lexer {
	source = "";
	index = 0;

	constructor(source) {
		if(typeof source !== 'string')
			throw new TypeError(`Expected 'source' to be a string, got ${typeof source} instead.`);

		this.source = source;
	}


	// Check if a '-' should be interpreted as a negative instead of a minus
	static is_negative(last_tk) {
		return !last_tk || last_tk.data === '(' || last_tk.data === '[' || last_tk.data === ',' ||
			last_tk.data === '=' ||
			(last_tk.type === Token.Operator && last_tk.modifier.op_type === 'infix');
	}

	// Get the Token type of a character
	static char_type(char, last_tk, continuation=false) {
		if(/\s/.test(char))
			return Token.None;

		if(char === '-' && !continuation && Lexer.is_negative(last_tk))
			return Token.Number;

		if((char >= '0' && char <= '9') || char === '.')
			return Token.Number;

		if(['&', '|', '>', '<', '+', '-', '*', '/', '%', '^', 'E', '!'].includes(char))
			return Token.Operator;

		if(char === '(' || char === ')')
			return Token.Paren;

		if(char === '[' || char === ']')
			return Token.Bracket;

		if(char >= 'a' && char <= 'z')
			return Token.Name;

		if(char === ',')
			return Token.Comma;

		if(char === '=')
			return Token.Equals;

		return Token.Unknown;
	}

	// Get the Token modifier
	static token_mod(data, type) {
		if(type === Token.Number || type === Token.Name) {
			if(data.startsWith('-')) return { negative: true };
			else return { negative: false };
		}
		else if(type === Token.Operator) {
			if(data === '!') return { op_type: 'postfix' };
			else return { op_type: 'infix' };
		}
		else if(type === Token.Bracket && data.includes('[')) {
			if(data.startsWith('-')) return { negative: true };
			else return { negative: false };
		}
	}


	// Check for errors with token sequences
	token_error(last_tk, tk) {
		if(last_tk.type === Token.Comma && tk.type === Token.Comma)
			return new Err(Err.InvalidExpression);

		if(last_tk.type === Token.Equals && tk.type === Token.Equals)
			return new Err(Err.InvalidExpression);

		if(last_tk.type === Token.Bracket && last_tk.data !== ']' && tk.data === ']')
			return new Err(Err.InvalidExpression);

		return Err.none();
	}


	// Get the next token from `this.source`
	next(last_tk) {
		let ch = this.source[this.index];
		if(!ch) return null;

		let type = Lexer.char_type(ch, last_tk);

		// Skip whitespace
		while(type === Token.None) {
			ch = this.source[++this.index];
			if(!ch) return null;
			type = Lexer.char_type(ch, last_tk);
		}

		// 1-character tokens
		if(type !== Token.Number && type !== Token.Name) {
			this.index++;
			return new Token(type, ch, Lexer.token_mod(ch, type));
		}

		let chars = "";
		let next_type = type;

		while(next_type === type) {
			chars += ch;

			ch = this.source[++this.index];
			if(!ch) break;
			next_type = Lexer.char_type(ch, last_tk, true);

			// Negative variables
			if(chars === '-' && type === Token.Number && next_type === Token.Name)
				type = Token.Name;
		}

		// Negative lists
		if(chars === '-' && next_type === Token.Bracket) {
			this.index++;
			return new Token(next_type, ch, Lexer.token_mod(`-${ch}`, next_type));
		}

		const mod = Lexer.token_mod(chars, type);

		if(type === Token.Number) {
			if(mod.negative) chars = chars.slice(1);
			chars = +chars;
		}
		else if(type === Token.Name && mod.negative) {
			chars = chars.slice(1);
		}

		return new Token(type, chars, mod);
	}

	// Get all tokens and check for errors
	all() {
		let tk = this.next();
		let tokens = [];

		while(tk !== null) {
			tokens.push(tk);
			const last_tk = tk;
			tk = this.next(last_tk);

			if(tk) {
				const error = this.token_error(last_tk, tk);
				if(error.has_error()) return { tokens: [], error };
			}
		}

		return { tokens, error: Err.none() };
	}
}


export default Lexer;
