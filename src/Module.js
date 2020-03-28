import fs from "fs";
import Instance from "./instance"

export default class Module {
  constructor(code, exports = {}) {
    this.code = code;
    this.exports = exports;
  }

  async instantiate() {
    new Instance(code).instantiate()
  }
}
