import Calculator from "../src/include.mjs";


let test_results = { total: 0, passed: 0, failed: [] };

function test(string, expected) {
	test_results.total++;

	const result = Calculator.eval(string);
	const res_string = result.error.has_error() ? result.error.message : result.value.toString();

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
test("-2^3", "-8");

// Other calculator tests
test("1", "1");
test("-1", "-1");
test("1 + 2", "3");
test("5 - 22", "-17");
test("10 - 7", "3");
test("2 * 3", "6");
test("8 / 2", "4");
test("5 % 3", "2");
test("2 ^ 6", "64");
test("10E2", "1000");
// test("30E-1", "3");
test("6!", "720");
// test("0.1 + 0.2", "0.3");



console.log(`Passed ${test_results.passed} of ${test_results.total} tests.`);

for(let f in test_results.failed) {
	const test = test_results.failed[f];
	console.log(`Failed test ${test.index}: Expected '${test.expected}', got '${test.actual}'`);
}
