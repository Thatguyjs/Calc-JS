// Small testing library

class Tester {

	static CORRECT = 0;
	static INCORRECT = 1;
	static END = 2;

	output = { ALL: 0, ERROR: 1, NONE: 2 };
	output_level = Tester.output.ALL;

	tests = [];
	index = 0;
	result = { total: null, correct: 0, incorrect: 0 };


	constructor(output_level) {
		if(typeof output_level === 'number') {
			this.output_level = output_level;
		}
	}


	load(tests) {
		if(!Array.isArray(tests)) tests = [tests];
		this.tests.push(...tests);
	}

	unload() {
		this.tests = [];
	}


	#prep_run() {
		if(this.index === 0) {
			this.result.total = this.tests.length;
		}
	}

	#test(ind) {
		if()
	}

	next() {
		this.#prep_run();
		return this.#test(this.index++);
	}

	all() {
		this.#prep_run();
	}


	reset() {
		this.index = 0;
		this.result = { total: null, correct: 0, incorrect: 0 };
	}

}
