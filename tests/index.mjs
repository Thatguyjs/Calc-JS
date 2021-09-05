import Calculator from "../src/include.mjs";


const levels = {
	ALL: 0,
	ERROR: 1,
	NONE: 2
};

const output = levels.ALL;
let test_results = { total: 0, passed: 0, failed: [] };


function test(string, expected) {
	test_results.total++;

	const results = Calculator.eval(string);
	let res_string = "";

	for(let r in results) {
		if(!results[r].error) res_string += results[r].value.toString();
		else res_string += results[r].error.message;
		res_string += ', ';
	}

	if(res_string) res_string = res_string.slice(0, -2);

	if(res_string !== expected)
		test_results.failed.push({ actual: res_string, expected, index: test_results.total - 1 });
	else
		test_results.passed++;
}


test('1', '1');
test('1 + 2', '3');


console.log(`Passed ${test_results.passed} of ${test_results.total} tests.`);

for(let f in test_results.failed) {
	const test = test_results.failed[f];
	console.log(`Failed test ${test.index}: Expected '${test.expected}', got '${test.actual}'`);
}
