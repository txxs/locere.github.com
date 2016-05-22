---
layout: article
title: "慕课网SpringMVC数据绑定"
modified:
categories: articles
excerpt: ""
comments: true
tags: []
image: 
  feature: 1600x800.gif.jpg
  teaser: 4002502.jpg
  thumb:
date: 2016-05-19T10:57:29+08:00
---

{% include toc.html %}

{% highlight java %}

{% endhighlight %}

## 基本类型

{% highlight java %}

    //todo     http://localhost:8080/baseType.do?age=10
    //todo 500 http://localhost:8080/baseType.do
    //todo 400 http://localhost:8080/baseType.do?age=abc
    @RequestMapping(value = "baseType.do")
    @ResponseBody
    public String baseType(int age){
        return "age:"+age;
    }

{% endhighlight %}

int值是不可以为空的，否则前台会报500错误，可以用RequestParam,是有一个要必传的

## 封装类型

{% highlight java %}

    //todo     http://localhost:8080/baseType2.do?age=10
    //todo     http://localhost:8080/baseType2.do
    //todo 400 http://localhost:8080/baseType2.do?age=abc
    @RequestMapping(value = "baseType2.do")
    @ResponseBody
    public String baseType2(Integer age){
        return "age:"+age;
    }

{% endhighlight %}

Integer为包装类型，可以为在参数传递的时候可以为null

## 数组

{% highlight java %}

    //todo http://localhost:8080/array.do?name=Tom&name=Lucy&name=Jim
    @RequestMapping(value = "array.do")
    @ResponseBody
    public String array(String[] name){
        StringBuilder sbf = new StringBuilder();
        for(String item : name){
            sbf.append(item).append(" ");
        }
        return sbf.toString();
    }

{% endhighlight %}

注意传递参数数组的形式

## 多层级对象的数据绑定

{% highlight java %}

    //todo http://localhost:8080/object.do?name=Tom&age=10
    //TODO http://localhost:8080/object.do?name=Tom&age=10&contactInfo.phone=10086
    //TODO http://localhost:8080/object.do?user.name=Tom&admin.name=Lucy&age=10
    @RequestMapping(value = "object.do")
    @ResponseBody
    public String object(User user,Admin admin){
        return user.toString()+" "+admin.toString();
    }


    @InitBinder("user")
    public void initUser(WebDataBinder binder){
        binder.setFieldDefaultPrefix("user.");
    }
    @InitBinder("admin")
    public void initAdmin(WebDataBinder binder){
        binder.setFieldDefaultPrefix("admin.");
    }

{% endhighlight %}


有一个user类，有一个contactInfo类，利用InitBinder来区分同属性的不同对象

## List数据绑定

首先定义一个类用来接收

{% highlight java %}

public class UserListForm {
    private List<User> users;

    public List<User> getUsers() {
        return users;
    }

    public void setUsers(List<User> users) {
        this.users = users;
    }

    @Override
    public String toString() {
        return "UserListForm{" +
                "users=" + users +
                '}';
    }
}

{% endhighlight %}

分别是第0个对象等

{% highlight java %}

    //TODO http://localhost:8080/list.do?users[0].name=Tom&users[1].name=Lucy
    //TODO http://localhost:8080/list.do?users[0].name=Tom&users[1].name=Lucy&users[20].name=Jim
    @RequestMapping(value = "list.do")
    @ResponseBody
    public String list(UserListForm userListForm){
        return "listSize:"+userListForm.getUsers().size() + "  " + userListForm.toString();
    }

{% endhighlight %}

## Set数据绑定

set的对象

{% highlight java %}

public class UserSetForm {
    private Set<User> users;

    private UserSetForm(){

		//如果是0的话，会出现异常，set要进行初始化
        users = new LinkedHashSet<User>();
        users.add(new User());
        users.add(new User());
    }

    public Set<User> getUsers() {
        return users;
    }

    public void setUsers(Set<User> users) {
        this.users = users;
    }

    @Override
    public String toString() {
        return "UserSetForm{" +
                "users=" + users +
                '}';
    }
}

    //TODO http://localhost:8080/set.do?users[0].name=Tom&users[20].name=Lucy
    @RequestMapping(value = "set.do")
    @ResponseBody
    public String set(UserSetForm userSetForm){
        return userSetForm.toString();
    }

{% endhighlight %}


## Map的应用场景

{% highlight java %}

public class UserMapForm {
    private Map<String,User> users;

    @Override
    public String toString() {
        return "UserMapForm{" +
                "users=" + users +
                '}';
    }

    public Map<String, User> getUsers() {
        return users;
    }

    public void setUsers(Map<String, User> users) {
        this.users = users;
    }
}

    //TODO http://localhost:8080/map.do?users['X'].name=Tom&users['X'].age=10&users['Y'].name=Lucy
    @RequestMapping(value = "map.do")
    @ResponseBody
    public String map(UserMapForm userMapForm){
        return userMapForm.toString();
    }

{% endhighlight %}

## JSON数据绑定

会把RequestBody转化反序列化为User 对象


[原地址](http://www.imooc.com/video/11434)

{% highlight java %}

//    {
//        "name": "Jim",
//            "age": 16,
//            "contactInfo": {
//                "address": "beijing",
//                "phone": "10010"
//              }
//    }
    //application/json
    @RequestMapping(value = "json.do")
    @ResponseBody
    public String json(@RequestBody User user){
        return user.toString();
    }

{% endhighlight %}

## XML的数据绑定

{% highlight java %}

//    <?xml version="1.0" encoding="UTF-8" ?>
//    <admin>
//      <name>Jim</name>
//      <age>16</age>
//    </admin>
    //application/xml
    @RequestMapping(value = "xml.do")
    @ResponseBody
    public String xml(@RequestBody Admin admin){
        return admin.toString();
    }

@XmlRootElement(name="admin")
public class Admin {
    private String name;
    private Integer age;

    @XmlElement(name="name")
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @XmlElement(name="age")
    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    @Override
    public String toString() {
        return "Admin{" +
                "name='" + name + '\'' +
                ", age=" + age +
                '}';
    }
}

{% endhighlight %}

