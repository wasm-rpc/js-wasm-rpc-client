pub use wasm_rpc::error::Error;

pub const EXAMPLE_ERROR: Error = Error {
    code: 1,
    message: "Error Message",
};
