const Promise = require("bluebird");
const readFile = Promise.promisify(require("fs").readFile);
var exec = Promise.promisify(require('child_process').exec);
const assert = require('assert');
const { Module, Instance } = require("../src");
// const WasmRPCError = require('../src/WasmRPC').WasmRPCError;
var exec = Promise.promisify(require('child_process').exec);
const sinon  = require('sinon');

describe('Module', function() {
  describe('.new', async () => {
    let instance;

    beforeEach(async () => {
      let code = await readFile("./test/support/tester/dist/tester.wasm");
      module = new Instance(code);
      instance = await module.instantiate()
    });

    it("can handle complex types", async () => {
      assert.deepEqual(await instance.round_trip(
        42,
        "test",
        {key: "value"},
        Buffer.from([1,2,3])
      ), [
        42,
        "test",
        {key: "value"},
        Buffer.from([1,2,3])
      ]);
    });

    it("logs to the console", async () => {
      let spy = sinon.stub(process.stdout, 'write');
      await instance.println("hello world");
      assert(spy.calledWith("hello world\n"));
      spy.restore();
    });

    it("logs to warnings to stderr", async () => {
      let spy = sinon.stub(process.stderr, 'write');
      await instance.eprintln("hello world");
      assert(spy.called);
      spy.restore();
    });

    it("throws errors", async () => {
      try {
        await instance.panic()
      } catch (error) {
        assert(error.message === "unreachable")
        assert((error instanceof WebAssembly.RuntimeError))
      }
    });
  });
});

