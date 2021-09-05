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

	const result = Calculator.eval(string);
	const res_string = result.error ? result.error.message : result.value.toString();

	if(res_string !== expected)
		test_results.failed.push({ actual: res_string, expected, index: test_results.total - 1 });
	else
		test_results.passed++;
}


test("1", "1");
test("-1", "-1");
test("110 + 50", "160");
test("110 + 50 + (4 - 2 * 5) - 10 + 40", "184");
test("(110 + 50) * (2 - 4)", "-320");
test("2 ^ 5 * (3 - 4)", "-32");
test("2 ^ 6", "64");
test("0 - 8 - 0 - 5 ^ 3", "-133");
test("2E3", "2000");
test("4! - 3", "21");


console.log(`Passed ${test_results.passed} of ${test_results.total} tests.`);

for(let f in test_results.failed) {
	const test = test_results.failed[f];
	console.log(`Failed test ${test.index}: Expected '${test.expected}', got '${test.actual}'`);
}
