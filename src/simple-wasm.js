const _ = require("lodash");

class SimpleWasm {
  constructor ({exports} = {}) {
    this.instance = null;
    this.memory = null;
    this.exports = exports;
    this.memoryOffset = 0;
  }

  async load(code) {
    code = new Uint8Array(code);
    const module = await WebAssembly.compile(new Uint8Array(code));
    this.instance = await new WebAssembly.Instance(module, {env: this.env()})
    this.buffer = this.instance.exports.memory.buffer
    this.memory = new Uint32Array(this.buffer, 0, 10);
  }

  convertArraysToPointers(args) {
    return _.map(args, (value) => {
      if(Array.isArray(value)) {
        _.each(value, (arrayValue, index) => {
          this.memory[index] = arrayValue;
        });
        return this.memoryOffset++;
      } else {
        return value;
      }
    })
  }

  call(functionName, args, options = {}) {
    args = this.convertArraysToPointers(args);
    var returnValue = this.instance.exports[functionName].call(null, ...args);

    if(options.returnType == "array") {
      return new Uint32Array(this.buffer, returnValue, options.returnLength);
    } else {
      return returnValue;
    }
  }


  env() {
    return {
      memoryBase: 0,
      tableBase: 0,
      memory: new WebAssembly.Memory({initial: 256}),
      table: new WebAssembly.Table({initial: 0, element: 'anyfunc'}),
      ...this.exports,
    }
  }
}

module.exports = SimpleWasm;
