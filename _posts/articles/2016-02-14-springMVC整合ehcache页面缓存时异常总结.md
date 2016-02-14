---
layout: article
title: "简单使springMVC整合ehcache页面缓存时异常总结用markdown"
modified:
categories: articles
excerpt: ""
comments: true
tags: []
image: 
  feature: 1600x800.gif.jpg
  teaser: 异常.png
  thumb:
date: 2016-02-014T18:50:29+08:00
---

{% include toc.html %}

## maven添加jar包异常

在pom.xml中添加maven库中的jar包的时候，在提示中抛出下边错误。

{% highlight text %}
ArtifactTransferException: Failure to transfer net.sf.ehcache:ehcache-web:jar:2.0.4 from http://repo.maven.apache.org/maven2 was cached in the local repository, resolution will not be reattempted until the update 
 interval of central has elapsed or updates are forced. Original error: Could not transfer artifact net.sf.ehcache:ehcache-web:jar:2.0.4 from/to central (http://repo.maven.apache.org/maven2): connect timed out
{% endhighlight %}

上边这段话的大概意思是：对于这个包从maven中心传输到本地仓库失败，决定不会重新尝试下载jar包，直到mavne再改更新索引，或强制更新。

解决办法是：直接去本地仓库，把这个ehcache2.0.4库的目录删除掉（因为包没有下载下来），再次刷新你的项目就中以了，或者在你的项目上右击，选择maven--->update project就可以了，让maven重新下载。

## ClassNotFoundException

在添加ehcache的缓存工厂的cacheManager时，抛出下边的异常：

{% highlight text %}
org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'org.springframework.cache.interceptor.CacheInterceptor#0': Cannot resolve reference to bean 'cacheManager' while setting bean property 'cacheManager'; nested exception is org.springframework.beans.factory.CannotLoadBeanClassException: Cannot find class [org.springframework.cache.ehcache.EhCacheCacheManager] for bean with name 'cacheManager' defined in ServletContext resource [/WEB-INF/config/application-context.xml]; nested exception is java.lang.ClassNotFoundException: org.springframework.cache.ehcache.EhCacheCacheManager
{% endhighlight %}

令人困惑的是，这里的jar包已经有了，类存在于jar包中，原因是没有提供context的支持的jar包。添加如下的jar包即可

{% highlight javascript %}
		<dependency>
   			<groupId>org.springframework</groupId>
  			 <artifactId>spring-context-support</artifactId>
   			<version>3.2.13.RELEASE</version>
		</dependency>
{% endhighlight %}