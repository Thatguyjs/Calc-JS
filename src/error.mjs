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
	location = { start: null, end: null };

	constructor(code, message, location) {
		if(typeof message === 'object') {
			location = message;
			message = null;
		}

		this.code = code;
		this.message = message ?? messages[code] ?? "";
		this.location.start = location?.start ?? null;
		this.location.end = location?.end ?? null;
	}

	static none() {
		return new Err(Err.None, "");
	}

	has_error() {
		return this.code !== Err.None;
	}
}


export default Err;
