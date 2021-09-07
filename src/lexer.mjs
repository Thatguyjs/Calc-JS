import Token from "./token.mjs";
import Expr from "./expr.mjs";


class Lexer {
	source = "";
	index = 0;

	constants = {};
	functions = {};

	constructor(source) {
		this.source = source;
	}

	// Generate the next token and increment `this.index` accordingly
	next(last_tk) {
		let ch = this.source[this.index];
		if(ch === undefined) return null;

		let chars = "";
		let type = Token.char_type(ch);

		while(ch && type === Token.None) {
			ch = this.source[++this.index];
			type = Token.char_type(ch ?? '');
		}

		let next_type = type;

		// Stop searching if the type only uses 1 character
		if(type !== Token.Number && type !== Token.Name) {
			this.index++;
			return new Token(ch, last_tk);
		}

		while(next_type === type) {
			chars += ch;

			ch = this.source[++this.index];
			if(ch === undefined) break;

			next_type = Token.char_type(ch, last_tk);
		}

		return new Token(chars, last_tk);
	}

	// Generate all tokens
	all() {
		let tk = this.next();
		let tokens = [];

		while(tk !== null) {
			if(tk.type !== Token.None) tokens.push(tk);
			tk = this.next(tk);
		}

		return tokens;
	}
}


export default Lexer;
