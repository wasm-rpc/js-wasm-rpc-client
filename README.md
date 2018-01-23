# SimpleWASM

SimpleWasm lets you execute WASM code without worrying about array buffers or
memory management.



## Installation

Using npm:
```shell
$ npm i --save simple-wasm
```

## Usage


    async function run() {
      const Promise = require("bluebird");
      const readFile = Promise.promisify(require("fs").readFile);

      wasm = new SimpleWasm({
        exports: {
          log: console.log
        }
      });
      code = await readFile("./myprogram.wasm");
      await wasm.load(code);
      wasm.call("sum", [[1, 2, 3], 3]);
      # => 6
    }
    run();


For an example of how to generate wasm files check out the [test app](https://github.com/masonforest/simple_wasm/tree/master/test/support/wasm) in this
project.
