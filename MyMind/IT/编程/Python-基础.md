---
layout: post
title: Python 基础
date: 2026-02-17 12:00:00 +0800
slug: Python-基础
category: IT
categories:
- IT
tags:
- Python
- 编程语言
- 编程
source_path: IT/编程/Python 基础.md
aliases:
- Python 语法
---

---

## 一、循环

### while 循环

有一个可选的 `else` 从句——循环正常结束（不是被 `break` 打断）时执行：

```python
i = 0
while i < 5:
    print(i)
    i += 1
else:
    print("循环正常结束")
```

### for 循环

Python 的 for 和 C/Java 不同，更像是 for-each：

```python
for i in range(0, 5):    # 0, 1, 2, 3, 4
    print(i)
else:
    print("循环正常结束")  # 同样有可选的 else
```

> [!tip] else 从句的实际用途
> 常用于"在循环中搜索，没找到时执行 else"的模式：
> ```python
> for item in items:
>     if item == target:
>         print("找到了")
>         break
> else:
>     print("没找到")  # 只有循环没被 break 时才执行
> ```

---

## 二、函数

### 默认参数

默认值的参数要放在**后面**：

```python
def say(message, times=1):
    print(message * times)

say("Hello ")         # Hello
say("Hello ", 3)      # Hello Hello Hello
```

### 关键参数

调用时**指定参数名**，不用管顺序：

```python
def func(a, c, b="20"):
    print(a, b, c)

func(c=50, a=100)     # 100 20 50（b 用默认值）
```

### 可变参数

```python
# *args — 以元组形式接收多余的位置参数
def sum_all(power, *args):
    return [x ** power for x in args]

sum_all(2, 1, 2, 3)   # [1, 4, 9]

# **kwargs — 以字典形式接收多余的关键字参数
def info(**kwargs):
    for key, value in kwargs.items():
        print(f"{key}: {value}")

info(name="Neo", age=25)
# name: Neo
# age: 25
```

### lambda 表达式

用来创建匿名函数对象，后面跟的是**表达式**而不是语句：

```python
def make_repeater(n):
    return lambda s: s * n

twice = make_repeater(2)
print(twice("Hello "))   # Hello Hello
```

---

## 三、DocStrings 文档字符串

用 `'''` 或 `"""` 包围，首行以大写字母开始、句号结尾，第二行空行，第三行起详细描述：

```python
def my_func():
    '''This is a brief description.

    More detailed explanation goes here.
    Can span multiple lines.
    '''
    pass

print(my_func.__doc__)   # 访问文档字符串
```

也可以在命令行查看：`python -c "import mymodule; help(mymodule)"`

---

## 四、模块

```python
import sys                    # 导入 sys 模块
import pickle as p            # 导入并起别名
from sys import argv          # 只导入 argv，使用时不需要 sys. 前缀
```

### `__name__` 变量

| 场景 | `__name__` 的值 |
|------|-----------------|
| 直接运行 `python myfile.py` | `"__main__"` |
| 被其他文件 `import myfile` | `"myfile"`（模块名） |

```python
if __name__ == "__main__":
    # 只有直接运行时才执行，被 import 时不执行
    main()
```

### `dir()` 函数

```python
dir()       # 列出当前作用域定义的名称列表
dir(sys)    # 列出 sys 模块内定义的名称列表
```

---

## 五、数据结构
[[_resources/Python 基础/Pasted image 20260217215943.jpg|Open: Pasted image 20260217215943.png]]
![[_resources/Python 基础/Pasted image 20260217215943.jpg]]
### 列表（list）— 有序可变

```python
shoplist = ['apple', 'mango', 'carrot', 'banana']
shoplist.append('rice')        # 末尾添加
shoplist.sort()                # 排序
del shoplist[0]                # 删除第一项
```

**列表推导式：**

```python
listone = [2, 3, 4]
listtwo = [2 * i for i in listone if i > 2]
# → [6, 8]
```

### 元组（tuple）— 有序不可变

```python
zoo = ('wolf', 'elephant')
new_zoo = ('monkey', 'dolphin', zoo)    # 元组可以嵌套
```

> [!warning] 一个元素的元组
> 必须加逗号，否则 Python 会当成普通括号：
> ```python
> singleton = (2,)    # ✅ 元组
> not_tuple = (2)     # ❌ 这只是数字 2
> ```

元组常用于格式化输出：

```python
name = "Neo"
age = 25
print('%s is %d years old' % (name, age))
```

### 字典（dict）— 键值对映射
[[_resources/Python 基础/Pasted image 20260217220018.jpg|Open: Pasted image 20260217220018.png]]
![[_resources/Python 基础/Pasted image 20260217220018.jpg]]


```python
d = {'n1': 'cc', 'n2': 'dd'}
d['n3'] = 'ee'                 # 添加/修改
del d['n1']                    # 删除
```

**两个列表合成字典 / 字典分解为列表：**

```python
list1 = ['a', 'b', 'c']
list2 = [1, 2, 3]

d = dict(zip(list1, list2))    # {'a': 1, 'b': 2, 'c': 3}
keys = list(d.keys())          # ['a', 'b', 'c']
values = list(d.values())      # [1, 2, 3]
```

### 集合（set）— 无序不重复
[[_resources/Python 基础/Pasted image 20260217220114.jpg|Open: Pasted image 20260217220114.png]]
![[_resources/Python 基础/Pasted image 20260217220114.jpg]]

```python
s = {1, 2, 3, 2, 1}           # {1, 2, 3}
s.add(4)
s.discard(1)
```

### 序列切片

列表、元组、字符串都是序列，共享切片语法：

| 语法 | 含义 |
|------|------|
| `s[0]` | 第一项 |
| `s[-1]` | 最后一项 |
| `s[1:3]` | 索引 1 和 2 的项（不含 3） |
| `s[:]` | 整个序列的浅拷贝 |
| `s[:-1]` | 除最后一项的所有 |
| `s[::2]` | 每隔一个取一项 |

> [!info] 序列 vs 映射
> - **序列**（Sequence）：列表、元组、字符串 — 有序，按索引访问
> - **映射**（Mapping）：字典 — 无序，按键访问

---

## 六、面向对象

```python
class Person:
    def __init__(self, name):
        self.name = name

    def say_hi(self):
        print(f"Hello, I'm {self.name}")

p = Person("Neo")
p.say_hi()               # Hello, I'm Neo
```

### 关键点

- `self` 参数是默认传入的，表示对象本身（类似 Java 的 `this`）
- `__init__` 方法在对象**创建时立即执行**（构造方法）
- `__del__` 方法在对象**消逝时调用**（析构方法，很少手动使用）

### 继承

```python
class SchoolMember:
    def __init__(self, name, age):
        self.name = name
        self.age = age

class Teacher(SchoolMember):
    def __init__(self, name, age, subject):
        super().__init__(name, age)
        self.subject = subject
```

---

## 七、储存器（序列化）

可以将 Python 对象存储到文件中，后续再取回：

```python
import pickle

# 存入
data = {'name': 'Neo', 'scores': [90, 85, 92]}
with open('data.pkl', 'wb') as f:
    pickle.dump(data, f)

# 取回
with open('data.pkl', 'rb') as f:
    loaded = pickle.load(f)
print(loaded)   # {'name': 'Neo', 'scores': [90, 85, 92]}
```

> [!info] 备注
> Python 2 时代用 `cPickle`（C 实现，更快），Python 3 已统一为 `pickle`（内部自动使用 C 实现）。

---

## 八、exec / eval / repr

| 函数 | 用途 | 示例 |
|------|------|------|
| `exec()` | 执行**语句**（字符串或文件中的 Python 代码） | `exec('print("Hello")')` |
| `eval()` | 计算**表达式**并返回结果 | `eval('2 * 3')` → `6` |
| `repr()` | 获取对象的字符串表示形式 | `repr([1,2,3])` → `'[1, 2, 3]'` |

```python
exec('x = 10')           # 执行赋值语句
print(eval('x * 2'))     # 20

# repr 的特点：eval(repr(obj)) == obj（对大部分内置类型成立）
s = repr([1, 2, 3])      # '[1, 2, 3]'（字符串）
eval(s)                   # [1, 2, 3]（列表对象）
```

> [!warning] 安全提醒
> `exec` 和 `eval` 会执行任意代码，**不要在用户输入上使用**，否则有代码注入风险。
