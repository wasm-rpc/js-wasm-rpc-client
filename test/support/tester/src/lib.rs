#![feature(
    proc_macro_hygiene
)]
extern crate wasm_rpc;
extern crate wasm_rpc_macros;
extern crate wee_alloc;


#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;
use self::wasm_rpc_macros::export;

mod errors;

mod tester;
