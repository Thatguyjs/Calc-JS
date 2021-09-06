import Token from "./token.mjs";
import Expr from "./expr.mjs";
import Lexer from "./lexer.mjs";
import Parser from "./parser.mjs";


export default {

	eval: function(item, constants, functions) {
		if(typeof item === 'string')
			return this.eval_string(item, constants, functions);
		else if(Array.isArray(item))
			return this.eval_tokens(item, constants, functions);
		else if(item instanceof Expr)
			return this.eval_expr(item, constants, functions);

		else throw new TypeError("Invalid argument: " + item);
	},


	eval_string: function(str, constants, functions) {
		const lexer = new Lexer(str, constants, functions);
		return this.eval_tokens(lexer.all());
	},


	eval_tokens: function(tokens, constants, functions) {
		const expr = new Expr(tokens, constants, functions);
		return this.eval_expr(expr);
	},


	eval_expr: function(expr, constants, functions) {
		const parser = new Parser(expr, constants, functions);
		return parser.execute();
	}

};


export { Token, Expr, Lexer, Parser };
