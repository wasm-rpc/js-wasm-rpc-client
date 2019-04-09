const chalk = require('chalk');
const {promisify} = require('util');
const readFile = promisify(require("fs").readFile);
const { StringDecoder } = require('string_decoder');
const _ = require("lodash");
const cbor = require("cbor");
const LOG_LEVEL_ERROR = 1;
const LOG_LEVEL_WARNING = 3;
const LOG_LEVEL_INFO  = 6;

class WasmRPCError extends Error {}

class WasmRPC {
  constructor ({exports} = {}) {
    this.instance = null;
    this.reject = null;
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
    this.memory = new WebAssembly.Memory({});
    const module = await WebAssembly.compile(new Uint8Array(code));
    this.instance = await new WebAssembly.Instance(module, {
      env: this.env()
    })
  }

  malloc(size) {
    return this.instance.exports.__malloc(size)
  }

  writePointer(buffer) {
    const bufferWithLength = Buffer.concat([this.toBytesInt32(buffer.length), buffer]);
    const pointer = this.malloc(bufferWithLength.length);
    this.writeMemory(bufferWithLength, pointer);
    return pointer;
  }

  writeMemory(buffer, offset = 0) {
    var memory = new Uint8Array(this.instance.exports.memory.buffer, offset, buffer.length);
    buffer.forEach((value, index) => memory[index]= value);
  }


  readPointer(pointer) {
    var length = this.fromBytesInt32(this.readMemory(pointer, 4));
    return this.readMemory(pointer + 4, length);
  }

  readMemory(offset, length) {
    return new Uint8Array(this.instance.exports.memory.buffer, offset, length);
  }

  writePointers(args) {
    return _.map(args, (value) => {
      return this.writePointer(cbor.encode(value));
    })
  }

  call(functionName, ...args) {
    return new Promise((resolve, reject) => {
      var resultPointer;

      if(!this.instance.exports[functionName]) {
        reject(new WasmRPCError(`invalid export: ${functionName}`));
      };

      let argumentCount = this.instance.exports[functionName].length;
      if(argumentCount != args.length) {
        throw new WasmRPCError(`${functionName} expected ${argumentCount} arguments but ${args.length} ${args.length == 1 ? 'was' : 'were'} given`);
      } else {
        try {
          resultPointer = this.instance.exports[functionName]
            .call(null, ...this.writePointers(args));
        } catch (error) {
            reject(error)
        }
      }
      var statusCodeAndResult = this.readPointer(resultPointer);
      var statusCode = this.fromBytesInt32(statusCodeAndResult.slice(0, 4));
      var result;
      var resultBytes = Buffer.from(statusCodeAndResult.slice(4));

      if(resultBytes.length) {
        result = cbor.decode(Buffer.from(resultBytes));
      }

      if (statusCode) {
        let error = new WasmRPCError(result);
        error.code = statusCode;
        reject(error);
      } else {
        resolve(result);
      }
    });
  }


  env() {
    return {
      memory: this.memory,
      table: new WebAssembly.Table({initial: 0, element: 'anyfunc'}),
      __log_write: (logLevel, messagePtr) => {

        let messageBuffer = Buffer.from(this.readPointer(messagePtr));
        const decoder = new StringDecoder('utf8');
        const message = decoder.write(messageBuffer);
        if(message === "" ){return};

        switch (logLevel) {
          case LOG_LEVEL_ERROR:
            console.error(chalk.red(message))
            break;
          case LOG_LEVEL_WARNING:
            console.warn(chalk.yellow(message));
            break;
          case LOG_LEVEL_INFO:
            console.log(message);
            break;
        }

      },
      ...this.exports,
    }
  }
}

module.exports = {
  default: WasmRPC,
  WasmRPCError,
};
