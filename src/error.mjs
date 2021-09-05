class Err {
	code = null;
	message = "";

	constructor(code, message) {
		this.code = code;
		this.message = message;
	}

	static none() {
		return new Err(0, "");
	}
}


export default Err;
