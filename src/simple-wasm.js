const { StringDecoder } = require('string_decoder');
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
    this.memory = new WebAssembly.Memory({
      initial: 256,
      maximum: 512,
    });
    const module = await WebAssembly.compile(new Uint8Array(code));
    this.instance = await new WebAssembly.Instance(module, {
      env: this.env()
    })
  }

  writePointer(buffer) {
    var memory = new Uint32Array(this.instance.exports.memory.buffer, 0, buffer.length);
    memory[0] = buffer.length
    this.writeMemory(buffer, 2)
  }
  writeMemory(buffer, offset = 0) {
    var memory = new Uint32Array(this.instance.exports.memory.buffer, 0, buffer.length + offset);

    for (var i = offset; i < buffer.length + offset; i++) {
      memory[i] = buffer[i-offset];
    }
  }

  readMemory(offset, length) {
    return new Uint32Array(this.instance.exports.memory.buffer, offset, length);
  }

  readPointer(pointer) {
      var [pointer, length] = this.readMemory(pointer, 2);
      return this.readMemory(pointer, length);
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
    return this.instance.exports[functionName].call(null, 0);
  }


  env() {
    return {
      memoryBase: 0,
      tableBase: 0,
      memory: this.memory,
      table: new WebAssembly.Table({initial: 0, element: 'anyfunc'}),
      console_log: (ptr, len) => {
        var buf = new Buffer(this.instance.exports.memory.buffer, ptr, 11)
        const decoder = new StringDecoder('utf8');
        console.log("SimpleWasm:   " + decoder.write(buf));
      },
      ...this.exports,
    }
  }
}

module.exports = SimpleWasm;
