(module
 (table 0 anyfunc)
 (memory $0 1)
 (export "memory" (memory $0))
 (export "_inititalize" (func $_inititalize))
 (export "addTen" (func $addTen))
 (export "get_first" (func $get_first))
 (func $_inititalize (; 0 ;) (param $0 i32) (result i32)
  (i32.add
   (get_local $0)
   (i32.const 10)
  )
 )
 (func $addTen (; 1 ;) (param $0 i32) (result i32)
  (i32.add
   (get_local $0)
   (i32.const 10)
  )
 )
 (func $get_first (; 2 ;) (param $0 i32) (result i32)
  (i32.load
   (get_local $0)
  )
 )
)
