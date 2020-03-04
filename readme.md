# Data type
```
bool

int

uint

float

string

json object

null(null!=0)
```

```
_(func,...args);

float x;
_(assign,x,1.85);//x=1.85
_(bool,x);//return true
_(
    assign,
    _(x,int y,int z),
    `
    _(
        float,
        _(mul,y,z)
    )
    `
)
_(
    assign,
    _(x,float y,int z),
    `
    _(
        float,
        _(pow,y,z)
    )
    `
)
_(x,11,2);//return 22.0
_(x,11.0,2);//return 121.0

_(add,10,2).
_(div,int,5);//return 4

_(add,10.0,2.0).
_(div,5.0,float);//return 0.25
```

```
<type> <variableName>;//宣告變數
_(assign,<variableName>,<value>);//賦值
e.g:
int a;
_(assign,a,10);//a=10

_(define,<variableName>,_(<type>,<value>));//宣告變數並賦值
e.g:
_(define,a,_(int,10));//a=10

_(<type>,<value>);//轉型
e.g:
int a;
_(assign,a,10);
_(float,a);//return 10.0

_(add,int,10);//int作為佔位符號，不會執行func=>func不完整
_(
    _(add,int,10),
    9
);//等同 _(add,9,10)

`_(add,9,10)`;``作為凍結器，不會執行func=>func沒被觸發

_(
    assign,
    _(add,null),//null作為佔位符號，不會執行func=>func不完整
    `_(add,9,10)`//``作為凍結器，不會執行func=>func沒被觸發
);//執行 _(add)回傳19
```

# Variable
# Data type
# Expression
表達式
# Control flow
# Subroutine
子程序、像函數等等
# Abstract data type
# Concurrency

# Exception
例外處理