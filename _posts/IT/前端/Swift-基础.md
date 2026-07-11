---
layout: post
title: Swift 基础
date: 2026-02-17 12:00:00 +0800
slug: IT-前端-Swift-基础-13f604f
category: IT
categories:
- IT
tags:
- Swift
- iOS
- 编程语言
- 前端
source_path: IT/前端/Swift 基础.md
aliases:
- Swift 语法
---

---

## 一、变量与常量

```swift
var name = "Neo"       // 变量，可修改
let pi = 3.14159       // 常量，不可修改
```

- `var` 声明变量，`let` 声明常量
- Swift 有类型推断，大部分情况不需要显式写类型
- 能用 `let` 就用 `let`，编译器会提醒你把不需要修改的 `var` 改成 `let`

### 类型标注

```swift
let age: Int = 25
var greeting: String = "Hello"
var isValid: Bool = true
var price: Double = 9.99
```

---

## 二、显式类型转换

> [!important] Swift 不做任何隐式类型转换
> 不同类型之间必须**显式转换**才能运算，这和 JavaScript/Python 的自动转换完全不同。

```swift
let num1: Int = 10
let num2: Double = 3.14

// ❌ 报错：Int 和 Double 不能直接相加
// let result = num1 + num2

// ✅ 必须显式转换
let result = Double(num1) + num2   // 13.14
let result2 = num1 + Int(num2)     // 13（截断小数部分）
```

常用转换：

```swift
let intVal = Int(3.9)           // 3（截断，不是四舍五入）
let doubleVal = Double(42)      // 42.0
let strVal = String(100)        // "100"
let intFromStr = Int("42")      // Optional(42)，可能失败所以返回可选值
```

---

## 三、可选项（Optional）

Swift 最重要的安全特性之一——值**可以有，也可以为 nil**，用 `?` 标记。

```swift
var aName: String? = "ningcol"   // 有值
var bName: String? = nil          // 没有值

let url = URL(string: "http://www.baidu.com/")  // 返回 URL?，因为字符串可能不是合法 URL
```

> [!example] 类比
> 可选值就像一个盒子——盒子里**可能装了东西，也可能是空的**。你不能直接用盒子里的东西，必须先打开看看有没有。

### 强制解包（不推荐）

```swift
let name: String? = "Neo"
print(name!)   // 强制解包，如果 name 是 nil 会直接崩溃💥
```

> [!warning] 慎用 `!`
> 强制解包在值为 nil 时会导致运行时崩溃。除非你 100% 确定有值，否则用下面更安全的方式。

### if let — 可选绑定

确保有值才进入分支，安全解包：

```swift
let url = URL(string: "http://www.baidu.com/")

if let myURL = url {
    // myURL 是已解包的 URL，确定有值
    print(myURL)
} else {
    print("URL 无效")
}
```

可以同时解包多个可选值：

```swift
let name: String? = "Neo"
let age: Int? = 25

if let name = name, let age = age {
    print("\(name) 今年 \(age) 岁")
}
// 任意一个为 nil，整个 if 块都不执行
```

### guard else — 提前退出

和 `if let` 相反——**没有值就提前退出**，有值则在后续代码中继续使用：

```swift
func demo() {
    let aAge: Int? = 10

    guard let age = aAge else {
        // age 为 nil 时执行这里，必须 return/throw/break 退出
        print("nil")
        return
    }

    // 走到这里说明 age 一定有值，可以直接用
    print("guard let: " + String(age))
}
demo()  // 输出：guard let: 10
```

> [!tip] if let vs guard else 怎么选？
> - **if let**：适合"如果有值就做某事"的场景，逻辑在大括号内
> - **guard else**：适合"没有值就别往下了"的场景，减少嵌套层级，后续代码更平坦
>
> 实际开发中 `guard` 更常用——先排除异常情况，再处理正常逻辑。

---

## 四、空合运算符（`??`）

为可选值提供默认值——有值用本身，nil 则用 `??` 后面的：

```swift
let aName: String? = nil
let bName = aName ?? "默认名字"   // "默认名字"

let cName: String? = "Neo"
let dName = cName ?? "默认名字"   // "Neo"
```

可以链式使用：

```swift
let name = firstName ?? lastName ?? "匿名"
// 依次尝试，都为 nil 才用"匿名"
```

---

## 五、区间运算符

### 闭区间 `...`

```swift
for i in 1...5 {
    print(i)   // 1, 2, 3, 4, 5
}
```

### 半开区间 `..<`

```swift
for i in 1..<5 {
    print(i)   // 1, 2, 3, 4（不包含 5）
}
```

> [!tip]
> 遍历数组时半开区间很常用：`for i in 0..<array.count`

### 单侧区间

```swift
let names = ["Anna", "Brian", "Chris", "Dan", "Ella"]
let slice1 = names[2...]    // ["Chris", "Dan", "Ella"]（从索引 2 到末尾）
let slice2 = names[...2]    // ["Anna", "Brian", "Chris"]（从开头到索引 2）
let slice3 = names[..<2]    // ["Anna", "Brian"]（从开头到索引 2，不包含）
```

---

## 六、字符串插值

用 `\()` 在字符串中嵌入变量或表达式：

```swift
let name = "Neo"
let age = 25
print("我叫 \(name)，今年 \(age) 岁")
print("明年 \(age + 1) 岁")
```

多行字符串用三引号 `"""` ：

```swift
let text = """
第一行
第二行
第三行
"""
```

---

## 七、集合类型

### Array（数组）

```swift
var fruits = ["苹果", "香蕉", "橘子"]
fruits.append("葡萄")              // 添加
fruits.remove(at: 1)               // 删除索引 1
print(fruits.count)                // 元素个数
print(fruits.isEmpty)              // 是否为空
```

### Dictionary（字典）

```swift
var scores: [String: Int] = ["语文": 90, "数学": 95]
scores["英语"] = 88                // 添加/修改
let mathScore = scores["数学"]     // Optional(95)，因为 key 可能不存在

for (subject, score) in scores {
    print("\(subject): \(score)")
}
```

### Set（集合）

```swift
var colors: Set<String> = ["红", "绿", "蓝"]
colors.insert("黄")
print(colors.contains("红"))       // true
```

---

## 八、函数

```swift
// 基本函数
func greet(name: String) -> String {
    return "Hello, \(name)"
}

// 参数标签（外部名 + 内部名）
func greet(to person: String, with greeting: String) -> String {
    return "\(greeting), \(person)"
}
greet(to: "Neo", with: "Hi")

// 省略外部参数名
func add(_ a: Int, _ b: Int) -> Int {
    return a + b
}
add(3, 5)  // 调用时不需要写参数名

// 默认参数值
func power(base: Int, exponent: Int = 2) -> Int {
    var result = 1
    for _ in 0..<exponent { result *= base }
    return result
}
power(base: 3)          // 9（默认平方）
power(base: 3, exponent: 3)  // 27
```

---

## 九、闭包（Closure）

Swift 的闭包类似 JavaScript 的箭头函数：

```swift
// 完整写法
let add = { (a: Int, b: Int) -> Int in
    return a + b
}

// 简写（尾随闭包 + 类型推断 + 隐式返回）
let numbers = [3, 1, 4, 1, 5]
let sorted = numbers.sorted { $0 < $1 }   // [1, 1, 3, 4, 5]
```

---

## 十、枚举（Enum）

Swift 的枚举比大多数语言强大得多——可以有关联值和方法：

```swift
enum Direction {
    case north, south, east, west
}

// 关联值
enum NetworkResult {
    case success(data: String)
    case failure(error: String)
}

let result = NetworkResult.success(data: "{\"name\": \"Neo\"}")

switch result {
case .success(let data):
    print("成功：\(data)")
case .failure(let error):
    print("失败：\(error)")
}
```

---

## 十一、结构体 vs 类

| | struct（结构体） | class（类） |
|---|-----------------|------------|
| 类型 | **值类型**（赋值时复制） | **引用类型**（赋值时共享） |
| 继承 | 不支持 | 支持 |
| 初始化 | 自动生成成员初始化器 | 需要手动写 `init` |
| 适合 | 简单数据模型 | 需要继承或引用语义的场景 |

```swift
struct Point {
    var x: Double
    var y: Double
}

class Person {
    var name: String
    init(name: String) { self.name = name }
}

var p1 = Point(x: 1, y: 2)
var p2 = p1       // 复制了一份
p2.x = 100
print(p1.x)       // 1（p1 不受影响，值类型）

let a = Person(name: "Neo")
let b = a          // 指向同一个对象
b.name = "Tom"
print(a.name)      // "Tom"（a 也变了，引用类型）
```

> [!tip] Swift 官方建议
> **优先使用 struct**，只在需要继承或引用语义时才用 class。Swift 标准库中 `String`、`Array`、`Dictionary` 都是 struct。

---

## 十二、协议（Protocol）

类似其他语言的接口（Interface），定义一组要求：

```swift
protocol Describable {
    var description: String { get }
    func describe() -> String
}

struct Dog: Describable {
    var name: String
    var description: String { "狗狗 \(name)" }
    func describe() -> String { description }
}
```

Swift 的协议可以通过**扩展（Extension）提供默认实现**，这是 Swift 面向协议编程（POP）的基础。

---

## 十三、错误处理

```swift
enum LoginError: Error {
    case wrongPassword
    case userNotFound
}

func login(user: String, password: String) throws -> String {
    guard user == "Neo" else { throw LoginError.userNotFound }
    guard password == "123" else { throw LoginError.wrongPassword }
    return "登录成功"
}

// 使用 do-try-catch
do {
    let result = try login(user: "Neo", password: "456")
    print(result)
} catch LoginError.wrongPassword {
    print("密码错误")
} catch LoginError.userNotFound {
    print("用户不存在")
}

// 或者用 try? 转为可选值
let result = try? login(user: "Neo", password: "123")  // Optional("登录成功")
```
