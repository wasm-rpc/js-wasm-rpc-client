CLANG = ~/src/llvm-build/bin/clang
LLC = ~/src/llvm-build/bin/llc
S2WASM = s2wasm
WASM_AS = wasm-as
SRC_NAME = test
BUILD_DIR = _build
SRC_DIR = src

.PHONEY: all

all: build_dir $(SRC_NAME).wasm

build_dir:
	mkdir -p $(BUILD_DIR)

$(BUILD_DIR)/$(SRC_NAME).bc:  $(SRC_DIR)/$(SRC_NAME).c
	$(CLANG) -emit-llvm --target=wasm32 -Oz $< -c -o $@

$(BUILD_DIR)/$(SRC_NAME).s: $(BUILD_DIR)/$(SRC_NAME).bc
	$(LLC) -asm-verbose=false -o $@ $<

$(BUILD_DIR)/$(SRC_NAME).wast: $(BUILD_DIR)/$(SRC_NAME).s
	$(S2WASM) $< > $@

$(SRC_NAME).wasm: $(BUILD_DIR)/$(SRC_NAME).wast
	$(WASM_AS) $< -o $(SRC_NAME).wasm
