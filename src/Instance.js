const chalk = require('chalk');
const { StringDecoder } = require('string_decoder');
const cbor = require("borc");
const UINT_SIZE = 4;
const LOG_LEVEL_ERROR = 1;
const LOG_LEVEL_WARNING = 3;
const LOG_LEVEL_INFO  = 6;

function bufferToNumber(buffer) {
  return Buffer.from(buffer).readUIntLE(0, UINT_SIZE);
}

function numberToBuffer(number) {
  const buffer = Buffer.alloc(UINT_SIZE)
  buffer.writeUInt32LE(number)
  return buffer
}

export default class Instance {
  constructor(code, exports = {}) {
    this.code = code;
    this.exports = exports;
  }

  async instantiate() {
    const { module, instance } = await WebAssembly.instantiate(this.code, {
      env: {
      __log_write: (logLevel, messagePtr) => {
        let messageBuffer = Buffer.from(this.readPointer(messagePtr));
        const decoder = new StringDecoder('utf8');
        const message = decoder.write(messageBuffer);
        if(message === "" ){return};

        switch (logLevel) {
          case LOG_LEVEL_ERROR:
            console.error(chalk.red(message))
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
      },
    });
    Object.assign(this, instance.exports);
    return new Proxy(this, instanceHandler);
  }

  readNumber(pointer) {
    return bufferToNumber(this.readBytes(pointer, UINT_SIZE));
  }

  readBytes(pointer, length) {
    return new Uint8Array(this.memory.buffer, pointer, length);
  }

  readPointer(pointer) {
    const length = this.readNumber(pointer);
    return this.readBytes(pointer + UINT_SIZE, length);
  }

  writePointer(buffer) {
    const bufferWithLength = Buffer.concat([numberToBuffer(buffer.length), buffer]);
    const pointer = this.__malloc(bufferWithLength.length);
    this.writeMemory(bufferWithLength, pointer);
    return pointer;
  }

  writeMemory(buffer, offset = 0) {
    var memory = new Uint8Array(this.memory.buffer, offset, buffer.length);
    buffer.forEach((value, index) => memory[index]= value);
  }
}

const instanceHandler = {
  get: (instance, prop) => {
    if (instance[prop]) {
      return (...args) => {
        const argPointers = args.map(cbor.encode).map(instance.writePointer.bind(instance))
        return cbor.decodeFirst(instance.readPointer(instance[prop](...argPointers)));
      };
    }
    return instance[prop];
  },
};
