class Token {
	static None = 0;
	static Number = 1;
	static Operator = 2;
	static Paren = 3;
	static Name = 4;
	static Comma = 5;

	data = "";
	type = null;

	constructor(data) {
		this.data = data;
		this.type = Token.char_type(data[0]); // All characters of 'data' should produce the same type
	}

	// Return the token type of a single character
	static char_type(char) {
		const code = char.charCodeAt(0);

		// Numbers
		if((code >= 48 && code <= 57) || char === '.') {
			return Token.Number;
		}

		// Operators (in order: % * + - / = ^)
		else if([37, 42, 43, 45, 47, 61, 94].includes(code)) {
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

		// Comma
		else if(char === ',') {
			return Token.Comma;
		}
	}
}


export default Token;
