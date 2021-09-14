import Err from "./error.mjs";
import Token from "./token.mjs";
import Lexer from "./lexer.mjs";
import Formatter from "./formatter.mjs";
import Parser from "./parser.mjs";


export default {
	eval: function(string) {
		if(typeof string !== 'string') throw new TypeError("Invalid argument: " + string);

		const lexer = new Lexer(string);
		const tokens = lexer.all();

		const formatter = new Formatter(tokens);
		const exprs = formatter.all();

		const parser = new Parser(exprs);
		const result = parser.next(); // TODO: Change to '.all()' once multiple expressions are supported

		return result;
	}
};


export { Token, Lexer, }; // Expr, Parser };
