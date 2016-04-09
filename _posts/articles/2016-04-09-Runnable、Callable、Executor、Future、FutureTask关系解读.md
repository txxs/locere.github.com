---
layout: article
title: "Runnable、Callable、Executor、Future、FutureTask关系解读"
modified:
categories: articles
excerpt: ""
comments: true
tags: []
image: 
  feature: 1600x800.gif.jpg
  teaser: 4002502.jpg
  thumb:
date: 2016-04-09T14:58:29+08:00
---

{% include toc.html %}

{% highlight java %}

{% endhighlight %}

[原文地址](http://blog.csdn.net/zhangzhaokun/article/details/6615454)

结合前边文章的代码理解

在再度温习Java5的并发编程的知识点时发现，首要的就是把Runnable、Callable、Executor、Future等的关系搞明白，遂有了下述小测试程序，通过这个例子上述三者的关系就一目了然了。

在java5以后，一个可以调度执行的线程单元可以有三种方式定义：

Thread、Runnable、Callable，其中Runnable实现的是void run()方法，Callable实现的是 V call()方法，并且可以返回执行结果，其中Runnable可以提交给Thread来包装下，直接启动一个线程来执行，而Callable则一般都是提交给ExecuteService来执行。

简单来说，Executor就是Runnable和Callable的调度容器，Future就是对于具体的调度任务的执行结果进行查看，最为关键的是Future可以检查对应的任务是否已经完成，也可以阻塞在get方法上一直等待任务返回结果。Runnable和Callable的差别就是Runnable是没有结果可以返回的，就算是通过Future也看不到任务调度的结果的。 

/**
 * 通过简单的测试程序来试验Runnable、Callable通过Executor来调度的时候与Future的关系
 */
{% highlight java %}

package com.hadoop.thread;

import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class RunnableAndCallable2Future {

	public static void main(String[] args) {

		// 创建一个执行任务的服务
		ExecutorService executor = Executors.newFixedThreadPool(3);
		try {
			//1.Runnable通过Future返回结果为空
			//创建一个Runnable，来调度，等待任务执行完毕，取得返回结果
			Future<?> runnable1 = executor.submit(new Runnable() {
				@Override
				public void run() {
					System.out.println("runnable1 running.");
				}
			});
			System.out.println("Runnable1:" + runnable1.get());

			// 2.Callable通过Future能返回结果
			//提交并执行任务，任务启动时返回了一个 Future对象，
			// 如果想得到任务执行的结果或者是异常可对这个Future对象进行操作
			Future<String> future1 = executor.submit(new Callable<String>() {
				@Override
				public String call() throws Exception {
					// TODO Auto-generated method stub
					return "result=task1";
				}
			});
			// 获得任务的结果，如果调用get方法，当前线程会等待任务执行完毕后才往下执行
			System.out.println("task1: " + future1.get());

			//3. 对Callable调用cancel可以对对该任务进行中断
			//提交并执行任务，任务启动时返回了一个 Future对象，
			// 如果想得到任务执行的结果或者是异常可对这个Future对象进行操作
			Future<String> future2 = executor.submit(new Callable<String>() {
				@Override
				public String call() throws Exception {				
					try {
						while (true) {
							System.out.println("task2 running.");
							Thread.sleep(50);
						}
					} catch (InterruptedException e) {
						System.out.println("Interrupted task2.");
					}
					return "task2=false";
				}
			});
			
			// 等待5秒后，再停止第二个任务。因为第二个任务进行的是无限循环
			Thread.sleep(10);
			System.out.println("task2 cancel: " + future2.cancel(true));

			// 4.用Callable时抛出异常则Future什么也取不到了
			// 获取第三个任务的输出，因为执行第三个任务会引起异常
			// 所以下面的语句将引起异常的抛出
			Future<String> future3 = executor.submit(new Callable<String>() {

				@Override
				public String call() throws Exception {
					throw new Exception("task3 throw exception!");
				}

			});
			System.out.println("task3: " + future3.get());
		} catch (Exception e) {
			System.out.println(e.toString());
		}
		// 停止任务执行服务
		executor.shutdownNow();
	}
}
{% endhighlight %}

执行结果如下：

{% highlight java %}

runnable1 running.
Runnable1:null
task1: result=task1
task2 running.
task2 cancel: true
Interrupted task2.
java.util.concurrent.ExecutionException: java.lang.Exception: Bad flag value!
{% endhighlight %}

FutureTask则是一个RunnableFuture<V>，即实现了Runnbale又实现了Futrue<V>这两个接口，另外它还可以包装Runnable和Callable<V>，所以一般来讲是一个符合体了，它可以通过Thread包装来直接执行，也可以提交给ExecuteService来执行，并且还可以通过v get()返回执行结果，在线程体没有执行完成的时候，主线程一直阻塞等待，执行完则直接返回结果。

{% highlight java %}

public class FutureTaskTest {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		Callable<String> task = new Callable<String>() {
			public String call() {
				System.out.println("Sleep start.");
				try {
					Thread.sleep(1000 * 10);
				} catch (InterruptedException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				System.out.println("Sleep end.");
				return "time=" + System.currentTimeMillis();
			}
		};
		
		//直接使用Thread的方式执行，线程的方式
		FutureTask<String> ft = new FutureTask<String>(task);
		Thread t = new Thread(ft);
		t.start();
		try {
			System.out.println("waiting execute result");
			System.out.println("result = " + ft.get());
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (ExecutionException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		//使用Executors来执行，线程池的方式，也可以以Runnable的方式运行
		System.out.println("=========");
		FutureTask<String> ft2 = new FutureTask<String>(task);
		Executors.newSingleThreadExecutor().submit(ft2);
		try {
			System.out.println("waiting execute result");
			System.out.println("result = " + ft2.get());
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (ExecutionException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	}
}

{% endhighlight %}

{% highlight java %}

waiting execute result  
Sleep start.  
Sleep end.  
result = time=1370844662537  
=========  
waiting execute result  
Sleep start.  
Sleep end.  
result = time=1370844672542  

{% endhighlight %}