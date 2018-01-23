const Promise = require("bluebird");
const readFile = Promise.promisify(require("fs").readFile);
var exec = Promise.promisify(require('child_process').exec);
const assert = require('assert');
const SimpleWasm = require('../src/simple-wasm');
var exec = Promise.promisify(require('child_process').exec);

describe('SimpleWasm', function() {
  describe('#call', async () => {
    var wasm;

    beforeEach(async () => {
      wasm = new SimpleWasm({
        exports: {
          exportedFunction: () => null
        }
      });
      code = await readFile("./test/support/wasm/test.wasm");
      await wasm.load(code);
    });

    it("echos values", async () => {
      assert.equal(wasm.call("echo", 99), 99);
    });

    it("calls exports", async () => {
      wasm = new SimpleWasm({
        exports: {
          exportedFunction: (value) => {
            assert.equal(value, 102);
          }
        }
      });
      code = await readFile("./test/support/wasm/test.wasm");
      await wasm.load(code);
      await wasm.call("call_exported_function", 102);
    });

    it.only("can pass array arguments", async () => {
      wasm = new SimpleWasm({
        exports: {
          exportedFunction: () => null
        }
      });
      code = await readFile("./test/support/wasm/test.wasm");
      await wasm.load(code);
      assert.equal(wasm.call("sum", [[1, 2, 3], 3]), 6);
    })
  });
});

