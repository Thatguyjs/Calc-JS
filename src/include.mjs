import Err from "./error.mjs";
import Token from "./token.mjs";
import Lexer from "./lexer.mjs";
import Formatter from "./formatter.mjs";
import Parser from "./parser.mjs";


export default {
	eval: function(string, constants={}, functions={}, macros={}) {
		if(typeof string !== 'string') throw new TypeError("Invalid argument: " + string);

		const lexer = new Lexer(string);
		const tokens = lexer.all();

		if(tokens.error.has_error())
			return [{ error: tokens.error }];

		const formatter = new Formatter(tokens.tokens, macros);
		const exprs = formatter.all();

		const parser = new Parser(exprs, constants, functions);
		const result = parser.all();

		return result;
	}
};


export { Err, Token, Lexer, Formatter, Parser };
