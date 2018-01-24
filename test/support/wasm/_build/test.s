	.text
	.file	"test.c"
	.hidden	echo
	.globl	echo
	.type	echo,@function
echo:
	.param  	i32
	.result 	i32
	copy_local	$push0=, $0
	.endfunc
.Lfunc_end0:
	.size	echo, .Lfunc_end0-echo

	.hidden	add_n_to_each
	.globl	add_n_to_each
	.type	add_n_to_each,@function
add_n_to_each:
	.param  	i32, i32
	.result 	i32
	.local  	i32
	i32.const	$2=, 0
.LBB1_1:
	block   	
	loop    	
	i32.const	$push8=, 12
	i32.eq  	$push0=, $2, $pop8
	br_if   	1, $pop0
	i32.const	$push7=, return_data
	i32.add 	$push1=, $2, $pop7
	i32.add 	$push2=, $0, $2
	i32.load	$push3=, 0($pop2)
	i32.add 	$push4=, $pop3, $1
	i32.store	0($pop1), $pop4
	i32.const	$push6=, 4
	i32.add 	$2=, $2, $pop6
	br      	0
.LBB1_3:
	end_loop
	end_block
	i32.const	$push5=, return_data
	.endfunc
.Lfunc_end1:
	.size	add_n_to_each, .Lfunc_end1-add_n_to_each

	.hidden	call_exported_function
	.globl	call_exported_function
	.type	call_exported_function,@function
call_exported_function:
	.param  	i32
	i32.call	$drop=, exportedFunction@FUNCTION, $0
	.endfunc
.Lfunc_end2:
	.size	call_exported_function, .Lfunc_end2-call_exported_function

	.hidden	sum
	.globl	sum
	.type	sum,@function
sum:
	.param  	i32, i32
	.result 	i32
	.local  	i32, i32
	i32.const	$3=, 0
.LBB3_1:
	block   	
	loop    	
	i32.ge_s	$push1=, $3, $1
	br_if   	1, $pop1
	i32.const	$push4=, 1
	i32.add 	$3=, $3, $pop4
	i32.load	$push2=, 0($0)
	i32.add 	$2=, $pop2, $2
	i32.const	$push3=, 4
	i32.add 	$push0=, $0, $pop3
	copy_local	$0=, $pop0
	br      	0
.LBB3_3:
	end_loop
	end_block
	copy_local	$push5=, $2
	.endfunc
.Lfunc_end3:
	.size	sum, .Lfunc_end3-sum

	.hidden	SIZE
	.type	SIZE,@object
	.section	.rodata,"a",@progbits
	.globl	SIZE
	.p2align	2
SIZE:
	.int32	3
	.size	SIZE, 4

	.hidden	return_data
	.type	return_data,@object
	.bss
	.globl	return_data
	.p2align	2
return_data:
	.skip	12
	.size	return_data, 12


	.ident	"clang version 7.0.0 (trunk 323069)"
	.functype	exportedFunction, i32
