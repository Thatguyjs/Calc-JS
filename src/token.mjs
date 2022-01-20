class Token {
	static None = 0;
	static Unknown = 1;
	static Number = 2;
	static Operator = 3;
	static Paren = 4;
	static Bracket = 5;
	static List = 6;
	static Name = 7;
	static Comma = 8;
	static Equals = 9;

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
