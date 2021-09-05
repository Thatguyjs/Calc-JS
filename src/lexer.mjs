import Token from "./token.mjs";
import Expr from "./expr.mjs";


class Lexer {
	source = "";
	index = 0;

	constructor(source) {
		this.source = source;
	}

	// Generate the next token and consume it from `this.source`
	next() {
		let ch = this.source[this.index] || null;
		let chars = "";
		let type = Token.char_type(ch);
		let next_type = type;

		let tk = null;

		while(next_type === type) {
			chars += ch;
			ch = this.source[++this.index];
			if(ch === undefined) break;

			next_type = Token.char_type(ch);
		}

		console.log("next():", this.source, ch, chars, type, next_type);

		return tk;
	}

	// Generate all tokens and completely consume `this.source`
	all() {
		let tk = this.next();
		let tokens = [];

		while(tk !== null) {
			tokens.push(tk);
			tk = this.next();
		}

		return tokens;
	}
}


export default Lexer;
