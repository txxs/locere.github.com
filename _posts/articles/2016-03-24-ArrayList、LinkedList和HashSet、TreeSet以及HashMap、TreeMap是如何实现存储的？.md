---
layout: article
title: "ArrayList、LinkedList和HashSet、TreeSet以及HashMap、TreeMap是如何实现存储的？"
modified:
categories: articles
excerpt: ""
comments: true
tags: []
image: 
  feature: 1600x800.gif.jpg
  teaser: 4002502.jpg
  thumb:
date: 2016-03-24T09:59:29+08:00
---
  
{% include toc.html %}

[原文地址](http://blog.csdn.net/snail_rao/article/details/7347467)

## ArrayList和LinkedList

对于ArrayList和LinkedList的存储方式相对简单，默认情况下就是顺序存储，先添加的元素在前面，后添加的元素在后面，**不同的是ArrayList底层是通过数组来维护**，**LinkedList底层是通过链表来维护**。这两种方式都可以重复添加相同的元素，根据应用情况不同自行选择。
 
## HashSet和TreeSet、HashMap和TreeMap

对于HashSet和TreeSet来说，里面的元素是不能重复的，若重复则会覆盖前面的那个元素。而对于HashMap和TreeMap来说，里面存储的是Key-Value对，在所有的键值对中，Key值是不能重复的，但Value值是可以重复的，若重复存储相同的Key值，则会把前面的那个Key-Value对中的Key和Value都覆盖掉。

OK，下面就HashSet、TreeSet和HashMap、TreeMap的存储方式作简单总结。

**HashSet的底层是通过HashMap来实现存储的**，**而TreeSet的底层又是通过TreeMap来实现存储的**，而且HashSet和TreeSet中的元素都是以Key值存储的，这也是HashSet和TreeSet的元素不能重复的原因。由此可见，我们只要理解HashMap和TreeMap的存储方式就可以了。

HashMap的存储相对于TreeMap来说要简单，在上一篇文章中已经讲到了，**其底层实际上维护的是一个Entry类型的数组table**，而具体怎么存储取决于添加元素hashcode值和table的长度决定，例如：String类中重写了hashCode方法，所以我们可以算出hash code值，但对于某些没有重写hashCode方法的类型，则直接调用Object类中的hashCode方法，然而这个方法对我们是不透明的，所以不能算出hashcode值，所以排序算法不得而知。这里我认为没必要深究，我们只需知道HashMap中的元素是乱序的即可，尽管这种乱序也是“有序”的。

而TreeMap的排序则透明了许多，与HashMap最大的不同点是：**TreeMap底层维护的是一个Entry类型的双向链表**，而不是数组，每个Entry类中都定义有key、value、parent、left、right等属性， key、value表示节点中的key-value对，left、right则指向链接到当前节点左右两边的那两个节点，parent表示最后加入链表的那个节点的父节点，只是起过渡的作用。

下面分两种情况来讨论添加元素的具体操作：

**第一种是添加的Key值类型是Java已有的类型**

我们知道TreeMap的底层代码是根据Key-Value对中的Key值来排序的，这种情况Coder可以自行定义比较器，当然也可以用TreeMap中默认的。若是自己定义的比较器，则在生成TreeSet或TreeMap对象的时候将其传入，如：
TreeSet<String> set = new TreeSet<String>(new MyComparator());
 
**第二种是添加的Key值类型不是Java已有类型，而是Coder自定义的类型**

对于Coder自己定义的类型(如用户定义一个Person类)，若想将其对象添加到TreeSet或TreeMap中，或是将其对象作为Key值添加到TreeMap中。Coder就必须定义自己的比较器，至少有两种方式可以定义该比较器，但无论哪一种都必须确定比较器要比较的对象，Coder可以用Person类中的某个属性作为比较器比较的对象，即以该属性来排序。

第一种方式：第一种情况一样，单独定义一个MyComparator类，不再赘述；

第二种方式：模仿Java底层默认比较器的方式，即让要添加的Person类实现Comparable接口，并在Person类中实现compareTo方法，这样TreeMap中的put方法就可以调用Person中的compareTo方法了，从而实现比较器。
可能有人会问，TreeMap不是以Key值来排序吗？你这里的Key值就是Person对象啊，那不是应该以Person对象来排序吗？怎么可以以Person对象中的属性来排序呢？问题的答案是：我们的比较器确实是以Person对象为参数传进去的，但比较器内部的比较算法我们可以用Person对象的属性来完成。
感觉说的有点乱，大家多多包涵！下面给出测试代码，以Person类中的score属性排序，希望大家提宝贵意见！


public class TreeSetTest2  
{  
       public static void main(String[] args)  
       {  
              TreeMap<Person,String> map = new TreeMap<Person,String>();  
               
              Person p1 = new Person(10, "zhangsan");  
              Person p2 = new Person(20, "lisi");  
              Person p3 = new Person(50, "zhangsan");  
              Person p4 = new Person(40, "wangwu");  
               
              map.put(p1, "第四名");  
              map.put(p2, "第三名");  
              map.put(p3, "第一名");  
              map.put(p4, "第二名");  
               
              Set<Entry<Person,String>> set = map.entrySet();  
              //打印map中的内容  
              for(Iterator<Map.Entry<Person,String>> iter = set.iterator(); iter.hasNext(); )  
              {  
                     Entry<Person,String> entry = iter.next();  
                     System.out.println(entry.getKey().name + ":" + entry.getKey().score + "分--" + entry.getValue());  
              }  
       }  
}  
   
//自定义的类  
class Person implements Comparable<Person>  
{  
       int score;  
       String name;  
        
       public Person(int score, String name)  
       {  
              this.score = score;  
              this.name = name;  
       }  
        
       public static int compare(int x, int y) {  
        return (x < y) ? -1 : ((x == y) ? 0 :1);  
    }  
        
       @Override  
       public int compareTo(Person o)  
       {  
              return compare(this.score, o.score);  
       }  
}  

[下边这篇文章的地址](http://shmilyaw-hotmail-com.iteye.com/blog/1836431)

## TreeSet底层是TreeMap实现，TreeMap底层是红黑树

TreeMap和TreeSet算是java集合类里面比较有难度的数据结构。和普通的HashMap不一样，普通的HashMap元素存取的时间复杂度一般是O(1)的范围。而TreeMap内部对元素的操作复杂度为O(logn)。虽然在元素的存取方面TreeMap并不占优，但是它内部的元素都是排序的，当需要查找某些元素以及顺序输出元素的时候它能够带来比较理想的结果。可以说，TreeMap是一个内部元素排序版的HashMap。这里会对TreeMap内部的具体实现机制和它所基于的红黑树做一个详细的介绍。另外，针对具体jdk里面TreeMap的详细实现，这里也会做详细的分析。

原文中有红黑树的介绍