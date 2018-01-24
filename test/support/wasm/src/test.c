const int SIZE = 3;
int return_data[SIZE];

int echo(int n) {
  return n;
}


int* add_n_to_each(int *values, int n) {
  for (int i=0; i<SIZE; i++) {
    return_data[i] = values[i] + n;
  }

   return &return_data;
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
