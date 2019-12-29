#Basic types
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

_(<type>,<variableName>,<value>);//宣告變數並賦值
e.g:
_(int,a,10);//a=10

_(<type>,<variableName>);//轉型
e.g:
int a;
_(assign,a,10);
_(float,a);//return 10.0
```