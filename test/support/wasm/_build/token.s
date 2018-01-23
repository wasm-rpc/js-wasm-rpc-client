	.text
	.file	"token.c"
	.hidden	_inititalize
	.globl	_inititalize
	.type	_inititalize,@function
_inititalize:
	.param  	i32
	.result 	i32
	i32.const	$push0=, 10
	i32.add 	$push1=, $0, $pop0
	.endfunc
.Lfunc_end0:
	.size	_inititalize, .Lfunc_end0-_inititalize

	.hidden	addTen
	.globl	addTen
	.type	addTen,@function
addTen:
	.param  	i32
	.result 	i32
	i32.const	$push0=, 10
	i32.add 	$push1=, $0, $pop0
	.endfunc
.Lfunc_end1:
	.size	addTen, .Lfunc_end1-addTen

	.hidden	get_first
	.globl	get_first
	.type	get_first,@function
get_first:
	.param  	i32
	.result 	i32
	i32.load	$push0=, 0($0)
	.endfunc
.Lfunc_end2:
	.size	get_first, .Lfunc_end2-get_first


	.ident	"clang version 7.0.0 (trunk 323069)"
