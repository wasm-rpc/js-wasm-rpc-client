const {promisify} = require('util');
const readFile = promisify(require("fs").readFile);
const { StringDecoder } = require('string_decoder');
const _ = require("lodash");
const cbor = require("cbor");

class SimpleWasmError extends Error {}

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

  async loadFile(file) {
    let code = await readFile(file);
    return await this.load(code);
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
    var buf = Buffer.from(this.readMemory(pointer + 4, length));
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

  encodeComplexTypes(args) {
    return _.map(args, (value) => {
      return this.writePointer(cbor.encode(value));
    })
  }

  call(functionName, ...args) {
    var resultPointer;

    let argumentCount = this.instance.exports[functionName].length;
    if(argumentCount != args.length) {
      throw new Error(`${functionName} expected ${argumentCount} arguemnts but ${args.length} ${args.length == 1 ? 'was' : 'were'} given`);
    } else if (Buffer.isBuffer(args)) {
      var argPointer = this.writePointer(args);
      resultPointer = this.instance.exports[functionName].call(null, argPointer);
      this.instance.exports.deallocate(argPointer);
    } else {
      resultPointer = this.instance.exports[functionName].call(null, ...this.encodeComplexTypes(args));
    }
    var statusCodeAndResult = this.readPointer(resultPointer);
    var statusCode = this.fromBytesInt32(statusCodeAndResult.slice(0, 4));
    var result;
    var resultBytes = Buffer.from(statusCodeAndResult.slice(4));

    if(resultBytes.length) {
      result = cbor.decode(Buffer.from(resultBytes));
    }

    if (statusCode) {
      let error = new SimpleWasmError(result);
      error.number = statusCode;
      throw error;
    } else {
      return result;
    }
  }


  env() {
    return {
      memoryBase: 0,
      tableBase: 0,
      memory: this.memory,
      table: new WebAssembly.Table({initial: 0, element: 'anyfunc'}),
      _print: (messagePtr) => {
        let message = Buffer.from(this.readPointer(messagePtr));
        const decoder = new StringDecoder('utf8');
        console.log("SimpleWasm:   " + decoder.write(message));
      },
      ...this.exports,
    }
  }
}

module.exports = {
  default: SimpleWasm,
  SimpleWasmError,
};
