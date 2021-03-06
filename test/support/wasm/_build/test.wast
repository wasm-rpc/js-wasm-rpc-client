(module
 (type $FUNCSIG$i (func (result i32)))
 (type $FUNCSIG$ii (func (param i32) (result i32)))
 (import "env" "exportedFunction" (func $exportedFunction (param i32) (result i32)))
 (table 0 anyfunc)
 (memory $0 1)
 (data (i32.const 12) "\03\00\00\00")
 (export "memory" (memory $0))
 (export "echo" (func $echo))
 (export "add_n_to_each" (func $add_n_to_each))
 (export "call_exported_function" (func $call_exported_function))
 (export "sum" (func $sum))
 (func $echo (; 1 ;) (param $0 i32) (result i32)
  (get_local $0)
 )
 (func $add_n_to_each (; 2 ;) (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (set_local $2
   (i32.const 0)
  )
  (block $label$0
   (loop $label$1
    (br_if $label$0
     (i32.eq
      (get_local $2)
      (i32.const 12)
     )
    )
    (i32.store
     (i32.add
      (get_local $2)
      (i32.const 16)
     )
     (i32.add
      (i32.load
       (i32.add
        (get_local $0)
        (get_local $2)
       )
      )
      (get_local $1)
     )
    )
    (set_local $2
     (i32.add
      (get_local $2)
      (i32.const 4)
     )
    )
    (br $label$1)
   )
  )
  (i32.const 16)
 )
 (func $call_exported_function (; 3 ;) (param $0 i32)
  (drop
   (call $exportedFunction
    (get_local $0)
   )
  )
 )
 (func $sum (; 4 ;) (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (set_local $3
   (i32.const 0)
  )
  (block $label$0
   (loop $label$1
    (br_if $label$0
     (i32.ge_s
      (get_local $3)
      (get_local $1)
     )
    )
    (set_local $3
     (i32.add
      (get_local $3)
      (i32.const 1)
     )
    )
    (set_local $2
     (i32.add
      (i32.load
       (get_local $0)
      )
      (get_local $2)
     )
    )
    (set_local $0
     (i32.add
      (get_local $0)
      (i32.const 4)
     )
    )
    (br $label$1)
   )
  )
  (get_local $2)
 )
)
