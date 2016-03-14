---
layout: article
title: "每日一道高频面试题"
modified:
categories: articles
excerpt: ""
comments: true
tags: []
image: 
  feature: 1600x800.gif.jpg
  teaser: Translate.jpg
  thumb:
date: 2016-03-14T13:50:29+08:00
---

{% include toc.html %}

{% highlight java %}

{% endhighlight %}

## 每日一道高频面试题#java

###  Object有哪些公用方法？

Object是所有类的父类，任何类都默认继承Object。
clone：
保护方法，实现对象的浅复制，只有实现了Cloneable接口才可以调用该方法，否则抛出CloneNotSupportedException异常

equals：
在Object中与==是一样的，子类一般需要重写该方法

hashCode:
该方法用于哈希查找，重写了equals方法一般都要重写hashCode方法。这个方法在一些具有哈希功能的Collection中用到

getClass:
final方法，获得运行时类型

wait:
使当前线程等待该对象的锁，当前线程必须是该对象的拥有者，也就是具有该对象的锁。wait()方法一直等待，直到获得锁或者被中断。wait(long timeout)设定一个超时间隔，如果在规定时间内没有获得锁就返回。 
调用该方法后当前线程进入睡眠状态，直到以下事件发生： 
1.其他线程调用了该对象的notify方法 
2.其他线程调用了该对象的notifyAll方法 
3.其他线程调用了interrupt中断该线程 
4.时间间隔到了 
此时该线程就可以被调度了，如果是被中断的话就抛出一个InterruptedException异常

notify:
唤醒在该对象上等待的某个线程

notifyAll:
唤醒在该对象上等待的所有线程

toString:
转换成字符串，一般子类都有重写，否则打印句柄






























