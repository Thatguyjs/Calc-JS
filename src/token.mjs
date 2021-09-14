class Token {
	static None = 0;
	static Unknown = 1;
	static Number = 2;
	static Operator = 3;
	static Paren = 4;
	static Comma = 5;

	type = Token.None;
	data = "";
	modifier = {};

	constructor(type, data, modifier={}) {
		this.type = type;
		this.data = data;
		this.modifier = modifier;
	}
}


export default Token;
