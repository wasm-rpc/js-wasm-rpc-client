const { StringDecoder } = require('string_decoder');
const _ = require("lodash");

class SimpleWasm {
  constructor ({exports} = {}) {
    this.instance = null;
    this.memory = null;
    this.exports = exports;
    this.memoryOffset = 0;
  }

  toBytesInt32 (num) {
      var arr = new ArrayBuffer(4);
      var view = new DataView(arr);
      view.setUint32(0, num, true);
      return new Uint8Array(arr);
  }

  fromBytesInt32 (buffer) {
      var arr = new ArrayBuffer(4);
      var view = new DataView(arr);
      buffer.forEach((value, index) => view.setUint8(index, value));
      return view.getUint32(0, true);
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
    const bufferWithLength = Buffer.concat([this.toBytesInt32(buffer.length), buffer]);
    const pointer = this.instance.exports.allocate(bufferWithLength.length);
    this.writeMemory(bufferWithLength, pointer);
    return pointer;
  }

  writeMemory(buffer, offset = 0) {
    var memory = new Uint8Array(this.instance.exports.memory.buffer, offset, buffer.length);
    buffer.forEach((value, index) => memory[index]= value);
  }

  readString(pointer) {
    var length = this.fromBytesInt32(this.readMemory(pointer, 4));
    var buf = new Buffer(this.readMemory(pointer + 4, length));
    const decoder = new StringDecoder('utf8');
    return decoder.write(buf);
  }

  readPointer(pointer) {
    var length = this.fromBytesInt32(this.readMemory(pointer, 4));
    return this.readMemory(pointer + 4, length);
  }

  readMemory(offset, length) {
    return new Uint8Array(this.instance.exports.memory.buffer, offset, length);
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

  call(functionName, ...args) {
    var resultPointer;

    if (Buffer.isBuffer(args)) {
      var argPointer = this.writePointer(args);
      resultPointer = this.instance.exports[functionName].call(null, argPointer);
      this.instance.exports.deallocate(argPointer);
    } else {
      console.log(functionName);
      console.log(args);
      console.log(this.instance.exports)
      console.log(this.instance.exports.constructor(100))
      resultPointer = this.instance.exports[functionName].call(null, ...args);
    }

    return resultPointer;
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
