class Token {
	static None = 0;
	static Unknown = 1;
	static Number = 2;
	static Operator = 3;
	static Paren = 4;
	static Name = 5;
	static Comma = 6;

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
