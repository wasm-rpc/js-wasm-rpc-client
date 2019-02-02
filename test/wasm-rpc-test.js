const Promise = require("bluebird");
const readFile = Promise.promisify(require("fs").readFile);
var exec = Promise.promisify(require('child_process').exec);
const assert = require('assert');
const WasmRPC = require('../src/WasmRPC').default;
const WasmRPCError = require('../src/WasmRPC').WasmRPCError;
var exec = Promise.promisify(require('child_process').exec);
const sinon  = require('sinon');

describe('WasmRPC', function() {
  describe('#call', async () => {
    var wasm;

    beforeEach(async () => {
      wasm = new WasmRPC();
      code = await readFile("./test/support/tester/dist/tester.wasm");
      await wasm.load(code);
    });

    it("returns simple values", async () => {
      assert.equal(await wasm.call("add", 1, 2), 3);
    });

    it("can handle complex types", async () => {
      assert.deepEqual(await wasm.call("round_trip",
        42,
        "test",
        {key: "value"},
        new Buffer([1,2,3])
      ), [
        42,
        "test",
        {key: "value"},
        new Buffer([1,2,3])
      ]);
    });

    it("logs to the console", async () => {
      let spy = sinon.stub(process.stdout, 'write');
      await wasm.call("println", "hello world");
      assert(spy.calledWith("hello world\n"));
      spy.restore();
    });

    it("logs to warnings to stderr", async () => {
      let spy = sinon.stub(process.stderr, 'write');
      await wasm.call("eprintln", "hello world");
      assert(spy.called);
      spy.restore();
    });

    it("throws errors", async () => {
      let spy = sinon.stub(process.stderr, 'write');
      wasm.call("throw").catch((error) => {
        assert(spy.called);
        spy.restore();
        assert((error instanceof WebAssembly.RuntimeError))
      })
    });
    it("returns error types", async () => {
      wasm.call("return_error").catch((error) => {
        assert((error instanceof WasmRPCError))
      })
    });
  });
});

