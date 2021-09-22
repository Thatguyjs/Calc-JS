// A minimal testing library

let results = [];


function fail(func_name, expected, actual, info) {
	results.push({
		success: false,
		func: func_name,
		expected,
		actual,
		info
	});

	return false;
}

function succeed(func_name, expected, actual, info) {
	results.push({
		success: true,
		func: func_name,
		expected,
		actual,
		info
	});

	return true;
}


function expect_eq(expected, actual, compare_func=null, test_info) {
	try {
		if(compare_func !== null) {
			if(!compare_func(expected, actual)) return fail('expect_eq', expected, actual, test_info);
			else return succeed('expect_eq', expected, actual);
		}
		else {
			if(expected !== actual) return fail('expect_eq', expected, actual, test_info);
			else return succeed('expect_eq', expected, actual);
		}
	}
	catch(err) {
		return fail('expect_eq', expected, err);
	}
}


function finish() {
	let failed = [];

	for(let r in results) {
		if(!results[r].success) failed.push(results[r]);
	}

	console.log(`${results.length - failed.length} of ${results.length} tests passed.`);

	for(let f in failed) {
		console.log(`Failed test "${failed[f].info || failed[f].func}": expected "${failed[f].expected}", got "${failed[f].actual}"`);
	}
}


export {
	fail,
	succeed,
	expect_eq,
	finish
};
