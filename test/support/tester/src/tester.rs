use wasm_rpc_macros::{export};
use wasm_rpc::error::Error;
use wasm_rpc::{Value, ObjectKey, BTreeMap};
use errors;

#[export]
pub fn add(a: i64, b: i64) -> Result<i64, Error> {
    Ok(a + b)
}

#[export]
pub fn round_trip(
    int: u64,
    string: String,
    object: BTreeMap<ObjectKey, Value>,
    bytes: Vec<u8>) -> Value {
    Value::Array(vec![
        int.into(),
        string.into(),
        object.into(),
        bytes.into(),
    ])
}

#[export]
pub fn println(message: String) -> Result<Value, Error> {
    println!("{}", message);
    Ok(Value::Null)
}

#[export]
pub fn eprintln(message: String) -> Result<Value, Error> {
    eprintln!("{}", message);
    Ok(Value::Null)
}

#[export]
pub fn throw() -> Result<Value, Error> {
    None::<Option<u32>>.unwrap();
    Ok(Value::Null)
}

#[export]
pub fn return_error() -> Result<Value, Error> {
    Err(errors::EXAMPLE_ERROR)
}
