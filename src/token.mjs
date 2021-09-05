class Token {
	static None = 0;
	static Number = 1;
	static Operator = 2;
	static Paren = 3;
	static Name = 4;
	static Equals = 5;
	static Comma = 6;

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

	constructor(data) {
		this.data = data;
		this.type = Token.char_type(data[0]); // All characters of 'data' should produce the same type
		this.modifier = Token.tk_modifier(this); // Modifiers only apply to single-char tokens, so this is fine
	}

	// Return the token type of a single character
	static char_type(char) {
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
	}

	// Return the token modifier (if applicible) of a single character
	static tk_modifier(token) {
		if(token.type === Token.Operator) {
			if(token.data === '!') return Token.mod.op.Postfix;
			else return Token.mod.op.Infix;
		}

		return null;
	}
}


export default Token;
