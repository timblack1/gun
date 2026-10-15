var expect = global.expect = require("./expect");

var Radix = require('../lib/radix');
var _ = String.fromCharCode(29);

describe('Radix', function(){ // moved to ./rad/rad.js
  it('read', function(){
		var rad = Radix();
		rad('asdf.pub', 'yum');
		rad('ablah', 'cool');
		rad('node/circle.bob', 'awesome');

		expect(rad('asdf.')).to.be.eql({pub: {'': 'yum'}});
		expect(rad('nv/foo.bar')).to.be(undefined);
  });

  it('primitive values (numbers, booleans, strings, null)', function(){
		var rad = Radix();
		rad('node/count', 42);
		rad('node/zero', 0);
		rad('node/active', true);
		rad('node/disabled', false);
		rad('node/empty', '');
		rad('node/nil', null);

		expect(rad('node/count')).to.be(42);
		expect(rad('node/zero')).to.be(0);
		expect(rad('node/active')).to.be(true);
		expect(rad('node/disabled')).to.be(false);
		expect(rad('node/empty')).to.be('');
		expect(rad('node/nil')).to.be(null);

		var mapped = {};
		Radix.map(rad, function(val, key){
			mapped[key] = val;
		});

		expect(mapped['node/count']).to.be(42);
		expect(mapped['node/zero']).to.be(0);
		expect(mapped['node/active']).to.be(true);
		expect(mapped['node/disabled']).to.be(false);
		expect(mapped['node/empty']).to.be('');
		expect(mapped['node/nil']).to.be(null);
  });

  it('strict mode primitive branch skipping without TypeError', function(){
		var fs = require('fs');
		var path = require('path');
		var radixSrc = fs.readFileSync(path.join(__dirname, '../lib/radix.js'), 'utf8');
		var loader = new Function('module', 'exports', '"use strict";\n' + radixSrc);
		var mod = { exports: {} };
		loader(mod, mod.exports);
		var StrictRadix = mod.exports;

		var tree = {
			item: {
				'': 'item_val',
				num: 123,
				flag: true,
				child: {
					'': 'child_val',
					score: 45.6
				}
			}
		};

		var visited = [];
		var errorCount = 0;
		var origError = console.error;
		var origLog = console.log;
		var intercept = function(err){
			if((err instanceof Error) || String(err).indexOf('TypeError') !== -1 || String(err).indexOf('Cannot create property') !== -1){
				errorCount++;
			}
		};
		console.error = intercept;
		console.log = intercept;

		try {
			StrictRadix.map(tree, function(val, key){
				visited.push({key: key, val: val});
			});
		} finally {
			console.error = origError;
			console.log = origLog;
		}

		expect(errorCount).to.be(0);
		expect(visited.length).to.be(2);
		expect(visited[0].key).to.be('item');
		expect(visited[0].val).to.be('item_val');
		expect(visited[1].key).to.be('itemchild');
		expect(visited[1].val).to.be('child_val');
  });
});