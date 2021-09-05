import Token from "./token.mjs";


class Expr {
	tokens = [];

	constructor(tokens=[]) {
		this.tokens = tokens;
	}

	static from_tokens(tokens, split_on) {
		if(!Array.isArray(tokens)) throw new TypeError(`Expected \`tokens\` to be an Array, got ${typeof tokens} instead`);

		let exprs = [];
		let expr_tokens = [];

		for(let t in tokens) {
			if(tokens[t].type === split_on) {
				exprs.push(expr_tokens);
				expr_tokens = [];
			}
			else expr_tokens.push(tokens[t].shift());
		}

		if(expr_tokens.length) exprs.push(expr_tokens);
		return exprs;
	}
}


export default Expr;
