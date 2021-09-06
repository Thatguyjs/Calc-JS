const messages = [
	'',
	'Invalid Operation',
	'Missing Operation'
];


class Err {
	static None = 0;
	static InvalidOperation = 1;
	static MissingOperation = 2;

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
