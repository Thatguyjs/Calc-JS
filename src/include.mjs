import Token from "./token.mjs";
import Expr from "./expr.mjs";
import Lexer from "./lexer.mjs";
import Parser from "./parser.mjs";


export default {

	eval: function(item) {
		if(typeof item === 'string')
			return this.eval_string(item);
		else if(item instanceof Expr)
			return this.eval_expr(item);

		else throw new Error("Invalid argument: " + item);
	},


	eval_string: function(str) {
		const lexer = new Lexer(str);
		return this.eval_expr(lexer.all());
	},


	eval_expr: function(expr) {
		const parser = new Parser(expr);
		return parser.execute();
	}

};


export { Token, Expr, Lexer, Parser };
