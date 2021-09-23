import { expect_eq, finish } from "./lib.mjs";

import addons from "./addons.mjs";
import Calculator from "../src/include.mjs";


let test_results = { total: 0, passed: 0, failed: [] };

function calculate(input) {
	let result = Calculator.eval(input, addons.constants, addons.functions, addons.macros);
	let res_list = [];

	for(let r in result)
		res_list.push(result[r].error.has_error() ? result[r].error.message : result[r].value.toString());

	return res_list.join(', ');
}

function test(input, expected) {
	let res = expect_eq(expected, calculate(input), null, input);

	const stripped_input = input.replaceAll(/\s+/g, '');
	if(res && stripped_input !== input) res = expect_eq(expected, calculate(stripped_input), null, stripped_input);

	return res;
}


// Basic number & order of operations tests
test("1", "1");
test("-1", "-1");
test("110 + 50", "160");
test("50 - 110", "-60");
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

// Constants
test("pi * 2.5", "7.853981634");
test("2.5pi", "7.853981634");

// Variables
test("x = 4, x", "4");
test("x, x = 4", "4");
test("x = -2, x", "-2");
test("x, x = -2", "-2");

// Tests from Calculator-Ext
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
test("300E-2", "3");
test("6!", "720");
test("0.1 + 0.2", "0.3");

// Multiple expressions, no variables
test("1 + 1, 2 + 3", "2, 5");
test("7 - 21, 3 * 5", "-14, 15");
test("5 / 2, 0.25 * 4 / 2", "2.5, 0.5");
test("3 - 2, 2, 5 / 2 + 0.5", "1, 2, 3");

// Implicit multiplication
test("2(3)", "6");
test("(7)2", "14");
test("a = 3, 6a", "18");
test("2sqrt(169)", "26");
test("sqrt(169)3", "39");
test("(2)3!", "12");
test("a = 11, b = 3, (a)b + 1", "34");

// Variables (single & multiple expressions)
test("a = 5, a + 1", "6");
test("a + 1, a = 5", "6");
test("a = 6, b = 4, a + b", "10");
test("a + b, a = 6, b = 4", "10");
test("a = 6, a + b, b = 4", "10");
test("a = 4 * 2, b = 16 / 4 + 4, a + b", "16");
test("a = 31, b = a + 11, a, b", "31, 42");
test("a, b, a = 31, b = a + 11", "31, 42");

// Functions & constants
test("pi", "3.1415926536");
test("e", "2.7182818285");
test("sqrt(36)", "6");
test("sum(2, 5, 9, 16)", "32");
test("sum()", "0");
test("round(0.49)", "0");
test("round(0.5)", "1");
test("floor(4.99)", "4");
test("ceil(2.01)", "3");
test("sum(2 + 3 / 2, 4 * 5)", "23.5");

test("(-1)!", "Invalid Operation");
test("( )", "Invalid Expression");
test("(", "Invalid Expression");
test(")", "Invalid Expression");
test("1, ,2", "Invalid Expression");
test("a==1", "Invalid Expression");
test("4 + a", "Unknown Variable");
test("notafunc(123, 456)", "Unknown Function");

test("def(n, 4), n", "4");

finish();
