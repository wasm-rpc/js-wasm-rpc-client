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

	.hidden	call_exported_function
	.globl	call_exported_function
	.type	call_exported_function,@function
call_exported_function:
	.param  	i32
	i32.call	$drop=, exportedFunction@FUNCTION, $0
	.endfunc
.Lfunc_end1:
	.size	call_exported_function, .Lfunc_end1-call_exported_function

	.hidden	sum
	.globl	sum
	.type	sum,@function
sum:
	.param  	i32, i32
	.result 	i32
	.local  	i32, i32
	i32.const	$3=, 0
.LBB2_1:
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
.LBB2_3:
	end_loop
	end_block
	copy_local	$push5=, $2
	.endfunc
.Lfunc_end2:
	.size	sum, .Lfunc_end2-sum


	.ident	"clang version 7.0.0 (trunk 323069)"
	.functype	exportedFunction, i32
