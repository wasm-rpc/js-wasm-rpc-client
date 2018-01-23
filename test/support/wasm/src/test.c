int echo(int n) {
  return n;
}

void call_exported_function(int n) {
   exportedFunction(n);
}


int sum(int *values, int length)
{
   int sum;
   for (int i=0; i<length; i++)
   {
    sum = sum + values[i];
   }
   return sum;
}
