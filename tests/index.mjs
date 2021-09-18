import addons from "./addons.mjs";
import Calculator from "../src/include.mjs";


let test_results = { total: 0, passed: 0, failed: [] };

function test(string, expected) {
	test_results.total++;

	const result = Calculator.eval(string, addons.constants, addons.functions);
	let res_string = "";

	for(let r in result) {
		res_string += (result[r].error.has_error() ? result[r].error.message : result[r].value.toString()) + ', ';
	}

	res_string = res_string.slice(0, -2);

	if(res_string !== expected)
		test_results.failed.push({ string, actual: res_string, expected, index: test_results.total - 1 });
	else
		test_results.passed++;
}


test("1", "1");
test("-1", "-1");
test("110 + 50", "160");
test("1 + 2 * 3", "7");
test("110 + 50 + (4 - 2 * 5) - 10 + 40", "184");
test("(110 + 50) * (2 - 4)", "-320");
test("2 ^ 5 * (3 - 4)", "-32");
test("2 ^ 6", "64");
test("0 - 8 - 0 - 5 ^ 3", "-133");
test("2E3", "2000");
test("4! - 3", "21");
test("-2^3", "-8");
test("-2^4", "-16");
test("2^-4", "0.0625");
test("(-2)^4", "16");

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
test("30E-1", "3");
test("30E-1 - 7", "-4");
test("6!", "720");
test("0.1 + 0.2", "0.3");

test("1 + 1, 2 + 3", "2, 5");
test("7 - 21, 3 * 5", "-14, 15");
test("5 / 2, 0.25 * 4 / 2", "2.5, 0.5");
test("3 - 2, 2, 5 / 2 + 0.5", "1, 2, 3");

test("pi", "3.1415926536");
test("e", "2.7182818285");
test("pi * 2.5", "7.853981634");
// test("sqrt(36)", "6");
// test("sum(2, 5, 9, 16)", "32");
// test("sum()", "0");
// test("round(0.49)", "0");
// test("round(0.5)", "1");
// test("floor(4.99)", "4");
// test("ceil(2.01)", "3");

test("2(3)", "6");
test("(7)2", "14");
test("3(2+3)", "15");
test("2.5pi", "7.853981634");
// test("a = 3, 6a", "18");
// test("2sqrt(169)", "26");
// test("sqrt(169)3", "39");
test("(2)3!", "12");
// test("a = 11, b = 3, (a)b + 1", "34");


console.log(`Passed ${test_results.passed} of ${test_results.total} tests.`);

for(let f in test_results.failed) {
	const test = test_results.failed[f];
	console.log(`Failed test ${test.index}: "${test.string}": Expected '${test.expected}', got '${test.actual}'`);
}
