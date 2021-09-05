import Token from "./token.mjs";
import Expr from "./expr.mjs";


class Lexer {
	source = "";
	index = 0;

	constructor(source) {
		this.source = source;
	}

	// Generate the next token and consume it from `this.source`
	next(last_tk) {
		let ch = this.source[this.index];
		if(ch === undefined) return null;

		let chars = "";
		let type = Token.char_type(ch);
		let next_type = type;

		while(next_type === type) {
			chars += ch;

			ch = this.source[++this.index];
			if(ch === undefined) break;

			next_type = Token.char_type(ch, last_tk);
		}

		return new Token(chars, last_tk);
	}

	// Generate all tokens and completely consume `this.source`
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
