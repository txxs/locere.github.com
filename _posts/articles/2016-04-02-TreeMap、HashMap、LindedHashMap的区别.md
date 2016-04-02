---
layout: article
title: "TreeMap、HashMap、LindedHashMap的区别"
modified:
categories: articles
excerpt: ""
comments: true
tags: []
image: 
  feature: 1600x800.gif.jpg
  teaser: 4002502.jpg
  thumb:
date: 2016-04-02T10:51:29+08:00
---

{% include toc.html %}

{% highlight java %}

{% endhighlight %}

## 区别

ava为数据结构中的映射定义了一个接口java.util.Map;它有四个实现类,分别是HashMap Hashtable LinkedHashMap 和TreeMap 

Map主要用于存储健值对，根据键得到值，因此不允许键重复(重复了覆盖了),但允许值重复。 

Hashmap 是一个最常用的Map,它根据键的HashCode 值存储数据,根据键可以直接获取它的值，具有很快的访问速度，遍历时，取得数据的顺序是完全随机的。**HashMap最多只允许一条记录的键为Null;允许多条记录的值为 Null**;HashMap不支持线程的同步，即任一时刻可以有多个线程同时写HashMap;可能会导致数据的不一致。如果需要同步，可以用 **Collections的synchronizedMap方法使HashMap具有同步的能力，或者使用ConcurrentHashMap**。 

Hashtable与 HashMap类似,它继承自Dictionary类，不同的是:**Hashtable不允许记录的键或者值为空;它支持线程的同步**，即任一时刻只有一个线程能写Hashtable,因此也导致了 Hashtable在写入时会比较慢。 

LinkedHashMap保存了记录的插入顺序，在**用Iterator遍历LinkedHashMap时，先得到的记录肯定是先插入的.也可以在构造时用带参数，按照应用次数排序**。在遍历的时候会比HashMap慢，不过有种情况例外，当HashMap容量很大，实际数据较少时，遍历起来可能会比LinkedHashMap慢，因为LinkedHashMap的遍历速度只和实际数据有关，和容量无关，而HashMap的遍历速度和他的容量有关。 

TreeMap实现SortMap接口，能够把它保存的记录根据键排序,默认是按键值的**升序排序**，也可以指定排序的比较器，**当用Iterator 遍历TreeMap时，得到的记录是排过序的**。 

一般情况下，我们用的最多的是HashMap,HashMap里面存入的键值对在取出的时候是随机的,它根据键的HashCode值存储数据,根据键可以直接获取它的值，具有很快的访问速度。在Map 中插入、删除和定位元素，HashMap 是最好的选择。 

TreeMap取出来的是排序后的键值对。但如果您要按自然顺序或自定义顺序遍历键，那么TreeMap会更好。 

LinkedHashMap 是HashMap的一个子类，如果需要输出的顺序和输入的相同,那么用LinkedHashMap可以实现,它还可以按读取顺序来排列，像连接池中可以应用。

## 字典Dictionary

字典是代表一个键/值存储库，工作很像映射抽象类。给定一个键和值，可以在一个Dictionary对象存储的值。一旦该值被存储，可以使用它的键检索。因此，像一个映射，词典可以被认为是作为**键/值对的列表**。它的作用和Map相似。**Hashtable继承自Dictionary类，而HashMap是Java1.2引进的Map interface的一个实现**。








