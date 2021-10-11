const messages = [
	'',
	'Unknown Error',
	'Invalid Operation',
	'Missing Operation',
	'Invalid Expression',
	'Unknown Variable',
	'Unknown Function',
	'Unknown Token'
];


class Err {
	static None = 0;
	static Other = 1;
	static InvalidOperation = 2;
	static MissingOperation = 3;
	static InvalidExpression = 4;
	static UnknownVariable = 5;
	static UnknownFunction = 6;
	static UnknownToken = 7;

	code = null;
	message = "";

	constructor(code, message) {
		this.code = code;
		this.message = message ?? messages[code] ?? "";
	}

	static none() {
		return new Err(Err.None, "");
	}

	has_error() {
		return this.code !== Err.None;
	}
}


export default Err;
