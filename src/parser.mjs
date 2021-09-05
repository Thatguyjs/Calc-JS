import Lexer from "./lexer.mjs";


class Parser {
	expr = [];

	constructor(expr) {
		this.expr = expr;
		this.expr.reorder();
	}

	execute() {

	}
}


export default Parser;
