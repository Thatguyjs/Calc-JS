import Err from "./error.mjs";


class Token {
	static None = 0;
	static Unknown = 1;
	static Number = 2;
	static Operator = 3;
	static Paren = 4;
	static Name = 5;
	static Equals = 6;
	static Comma = 7;

	static mod = {
		op: {
			Prefix: 0,
			Infix: 1,
			Postfix: 2
		}
	};

	data = "";
	type = null;
	modifier = null; // Special properties
	error = Err.none();

	constructor(data, last_tk, force_type=null) {
		this.data = data;
		if(force_type !== null) this.type = force_type;
		else this.type = Token.char_type(data[0], last_tk); // All characters of 'data' should produce the same type

		this.modifier = Token.tk_modifier(this, last_tk); // Modifiers only apply to single-char tokens, so this is fine
		this.error = Token.#tk_error(last_tk) ?? this.error;
	}


	// Check if a '-' is actually a negative sign
	static is_negative(last_tk) {
		return !last_tk || last_tk.data === '(' ||
			(last_tk.type === Token.Operator && last_tk.modifier !== Token.mod.op.Postfix);
	}

	// Find errors with tokens
	static #tk_error(last_tk) {
		if(this.data === ')' && last_tk.data === '(')
			return new Err(Err.InvalidOperation);

		if(this.type === Token.Operator && this.modifier !== Token.mod.op.Prefix) {
			if(!last_tk || last_tk.data === '(' || (last_tk.type === Token.Operator && last_tk.modifier !== Token.mod.op.Postfix))
				return new Err(Err.InvalidOperation);
		}

		if(this.type === Token.Number && last_tk.type === Token.Number)
			return new Err(Err.MissingOperation);
	}

	// Return the token type of a single character
	static char_type(char, last_tk) {
		const code = char.charCodeAt(0);

		// Numbers
		if((code >= 48 && code <= 57) || char === '.') {
			return Token.Number;
		}

		// Operators (in order: ! % * + - / ^ E)
		else if([33, 37, 42, 43, 45, 47, 94].includes(code) || char === 'E') {
			return Token.Operator;
		}

		// Parentheses
		else if(char === '(' || char === ')') {
			return Token.Paren;
		}

		// Function / constant / variable names
		else if(code >= 97 && code <= 122) {
			return Token.Name;
		}

		// Equals
		else if(char === '=') {
			return Token.Equals;
		}

		// Comma
		else if(char === ',') {
			return Token.Comma;
		}

		// Whitespace
		else if([32, 9, 10].includes(code)) {
			return Token.None;
		}

		return Token.Unknown;
	}

	// Return the token modifier (if applicible) of a single character
	static tk_modifier(token, last_tk) {
		if(token.type === Token.Operator) {
			if(token.data === '!') return Token.mod.op.Postfix;
			else if(token.data === '-' && Token.is_negative(last_tk)) return Token.mod.op.Prefix;
			else return Token.mod.op.Infix;
		}

		return null;
	}
}


export default Token;
