import Err from "./error.mjs";
import Token from "./token.mjs";
import Lexer from "./lexer.mjs";
import Formatter from "./formatter.mjs";
import Parser from "./parser.mjs";


export default {
	eval: function(string, addons={}) {
		if(typeof string !== 'string') throw new TypeError("Invalid argument: " + string);

		const lexer = new Lexer(string);
		const tokens = lexer.all();

		if(tokens.error.has_error())
			return [{ error: tokens.error }];

		const formatter = new Formatter(tokens.tokens, addons.macros);
		const groups = formatter.all();

		const parser = new Parser(groups, addons.constants, addons.functions);
		const result = parser.all();

		return result;
	},

	eval_tokens: function(tokens, addons={}) {
		if(Array.isArray(tokens)) tokens = { error: Err.none(), tokens };

		if(tokens.error.has_error())
			return [{ error: tokens.error }];

		const formatter = new Formatter(tokens.tokens, addons.macros);
		const groups = formatter.all();

		const parser = new Parser(groups, addons.constants, addons.functions);
		const result = parser.all();

		return result;
	}
};


export { Err, Token, Lexer, Formatter, Parser };
