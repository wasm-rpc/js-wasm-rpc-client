	.text
	.file	"echo.c"
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


	.ident	"clang version 7.0.0 (trunk 323069)"
