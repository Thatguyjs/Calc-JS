import { expect_eq, finish } from "./lib.mjs";

import addons from "./addons.mjs";
import Calculator from "../src/include.mjs";


function error_string(err) {
	if(err.location.start === null)
		return `Error: ${err.message}`;
	else if(err.location.start === err.location.end)
		return `Error at ${err.location.start}: ${err.message}`;
	else
		return `Error from ${err.location.start} to ${err.location.end}: ${err.message}`;
}


function calculate(input) {
	let result = Calculator.eval(input, addons);
	let res_list = [];

	for(let r in result) {
		let val = result[r].value;

		if(Array.isArray(val)) val = `[${val.join(', ')}]`;
		else val = val?.toString();

		res_list.push(result[r].error.has_error() ? error_string(result[r].error) : val);
	}

	return res_list.join(', ');
}

function test(input, expected, without_space=true) {
	let res = expect_eq(expected, calculate(input), null, input);

	if(without_space) {
		const stripped_input = input.replaceAll(/\s+/g, '');
		if(res && stripped_input !== input) res = expect_eq(expected, calculate(stripped_input), null, stripped_input);
	}

	return res;
}


// Basic number & order of operations tests
test("1", "1");
test("-1", "-1");
test("2 + -3", "-1");
test("-3 + 5", "2");
test("-3 * 5", "-15");
test("-3 / 2", "-1.5");
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

// Boolean & Bitwise operators
test("1 > 2", "0");
test("1 < 2", "1");
test("-3 + 5 > 2", "0");
test("-3 + 5 > 1.99", "1");
test("-3 + 5 < 2.01", "1");
test("2 | 8", "10");
test("3 | 2", "3");
test("7 & 2", "2");
test("7 & 2 > 1.99", "1");
test("7 & 2 < 2.01", "1");

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
test("x = 4, -x", "-4");

// Functions & constants
test("pi", "3.1415926536");
test("-pi", "-3.1415926536");
test("e", "2.7182818285");
test("sqrt(36)", "6");
test("sqrt(-1)", "Error from 5 to 6: Invalid Value");
test("sqrt()", "Error from 0 to 3: Invalid Value");
test("sum(2, 5, 9, 16)", "32");
test("-sum(2, 5, 9, 16)", "-32");
test("sum()", "0");
test("round(0.49)", "0");
test("round(0.5)", "1");
test("floor(4.99)", "4");
test("ceil(2.01)", "3");
test("sum(2 + 3 / 2, 4 * 5)", "23.5");

// Lists
test("[1, 2, 3]", "[1, 2, 3]");
test("-[1, 2, 3]", "[-1, -2, -3]");
test("-[-1, 2, -3]", "[1, -2, 3]");
test("[-1, 2, -3]", "[-1, 2, -3]");
test("-[3, 4]", "[-3, -4]");
test("[1 + 2 * 3, 6, 9 / 3 + 2]", "[7, 6, 5]");
test("2.5 + [1, 2, 3]", "[3.5, 4.5, 5.5]");
test("[1, 2, 3] + 2.5", "[3.5, 4.5, 5.5]");
test("[sum(sin(90 * pi / 180), 4), cos(pi)]", "[5, -1]");
test("[1, 2, 3] + [3, 2, 1]", "[4, 4, 4]");
test("[1, 2, 3] * [sum(1, 2, 3), 2, 1]", "[6, 4, 3]");
test("5 + [5, 10, 15] / 5", "[6, 7, 8]");
test("a = 3, [a, a + 2, a / 1.5] + 4", "[7, 9, 6]");
test("a = [1, 2, 3, 4, 5], a % 3 + 4", "[5, 6, 4, 5, 6]");
test("-[4, 5] ^ 2", "[-16, -25]");

// Errors
test("(-1)!", "Error from 1 to 2: Invalid Operation");
test("( )", "Error from 0 to 2: Invalid Expression", false);
test("()", "Error from 0 to 1: Invalid Expression");
test("(", "Error at 0: Invalid Expression");
test(")", "Error at 0: Invalid Expression");
test("[ ]", "Error from 0 to 2: Invalid Expression", false);
test("[]", "Error from 0 to 1: Invalid Expression");
test("[", "Error at 0: Invalid Expression");
test("]", "Error at 0: Invalid Expression");
test("[1] + [1, 2]", "Error: Invalid Operation");
test("1, ,2", "Error from 1 to 3: Invalid Expression", false);
test("1,,2", "Error from 1 to 2: Invalid Expression");
test("a==1", "Error from 1 to 2: Invalid Expression");
test("4 + a", "Error at 4: Unknown Variable", false);
test("4+a", "Error at 2: Unknown Variable");
test("notafunc(123, 456)", "Error from 0 to 7: Unknown Function");
test("2 *", "Error from 0 to 2: Invalid Operation", false);
test("* 2", "Error from 0 to 2: Invalid Operation", false);
test("2 * ()", "Error from 4 to 5: Invalid Expression", false);
test("2*()", "Error from 2 to 3: Invalid Expression", false);
test("() * 2", "Error from 0 to 1: Invalid Expression");
test("2 * 3 +", "Error from 0 to 6: Invalid Operation", false);
test("+ 3 * 2 - 1", "Error from 0 to 6: Invalid Operation", false);
test("abs(1 + )", "Error at 6: Invalid Operation", false);
test("abs(1 + !)", "Error from 6 to 8: Invalid Operation", false);
test("abs(1+!)", "Error from 5 to 6: Invalid Operation");
test("1 + !", "Error from 2 to 4: Invalid Operation", false);
test("1+!", "Error from 1 to 2: Invalid Operation");

// Macros
test("def(n, 4), n", "4");
test("def(n as 6), n * 2", "12", false);
test("def(n)", "Error from 0 to 5: Missing Macro Parameters");

finish();
