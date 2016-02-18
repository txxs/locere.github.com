---
layout: article
title: "Ehcache Web缓存"
modified:
categories: articles
excerpt: ""
comments: true
tags: []
image: 
  feature: 1600x800.gif.jpg
  teaser: Translate.jpg
  thumb:
date: 2016-02-18T10:50:29+08:00
---

{% include toc.html %}

## 介绍

Ehcache在ehcache-web模式下提供了一系列通用的web缓存过滤器。使用缓存可以使web应用的性能有一个明显的变化。一个典型的服务器可以从页面缓存中每秒响应5000个页面访问。内嵌的gzip压缩、存储和网络传输非常高效。缓存页面和片段对于磁盘存储是一个很好的替代，因为对象图简单而且最大的部分已经是byte[]。

## SimplePageCacheFilter

这是一个简单的缓存过滤缓存过滤器，适合可压缩的http相应，比如HTML、XML或者JSON。它使用了由默认的工厂方法创建的单例CacheManager。覆盖使用不同的CacheManger，它可以适用于

* 例如不是片段的完全响应

* 适合于gzipping压缩的内容类型，比如，text/html

对于片段的缓存看SimplePageFragmentCachingFilter

## Keys

页面是根据他们的key进行缓存的，缓存的key是URI加上查询串生成的。例如`/admin/SomePage.jsp?id=1234&name=Beagle.`这种key的技术可以被广泛的使用，它独立于主机门口那个字和端口数，在下边这几种情况下它可以有效的工作：一、多个域名获取同一个内容；二、多个用户基于不同的端口号访问。追踪软件可能会发生问题，独特的Id被插入到请求查询串中。因为每一个请求产生一个独特的key，那么它将永远都不会被缓存。对于这种情况，最好转换请求参数并重写`calculateKey(javax.servlet.http.HttpServletRequest) `

## 配置缓存名字

在ehcache.xml中的缓存实体应该利用filter的名字进行配置。可以使用init-param的`cacheName`设置，或者通过子类重写这个名字。

## 并发缓存丢失

缓存丢失会导致过滤链，缓存过滤器的上边的过滤器来处理。为了避免线程请求同一个key做重复的工作，这些线程应该在第一个线程后阻塞。通过设置init-param的`blockingTimeoutMillis`把等待了一段时间的超时线程设置为失效。默认情况下，线程会无限的等待，在这种情况下上游处理永远都不会返回，最终web服务器在没有响应的连接的情况下宕机。通过设置超时，等待的线程只阻塞超时的时间，然后抛出` {@link net.sf.ehcache.constructs.blocking.LockTimeoutException}`，在这种情况下，上游的失败依然会导致失败。

## Gzip压缩

提高网络的效率和压面的加载速度，同一通过gzip压缩获得。一个请求是否可以压缩根据如下情况判断：

* 用户代理是否可以接受GZIP编码，它的特点是HTTP1.1的一部分。如果浏览器接受GZIP编码，它将包括它的HTTP头一起广播：所有的浏览器除了IE5.2之外的浏览器都接受GZIP编码。大多数的查询引擎不接受GZIP编码。

* 是否用户代理已经广播了它接受GZIP编码。这是基于每一个请求的。如果他们接受了一个GZIP相应，他们必须在HTTP请求头中包含下边的语句` Accept-Encoding: gzip`

响应自动压缩并存储在缓存中，对于那些不接受GZIP编码的请求，页面从缓存中取出，解压然后返回给用户代理，解压的性能很高。

##缓存头

这个`SimpleCachingHeadersPageCachingFilter `继承自`SimplePageCachingFilter `来提供HTTP缓存头：ETag，Last-Mdified和Expires。它支持有条件的GET。因为浏览器和其他的http客户端在相应的头中包含过期的信息，他们甚至需要再一次的请求页面。即使本地的浏览器副本已经过期，浏览器也会做一个有条件的GET。所以你是否曾经想用SimplePageCachingFilter，哪个不用设置这些头？

答案是在一些缓存情况下，载它自然超期之前将页面移除。考虑页面包含动态数据的情况，在ehcache下元素可以在任何时刻都可以别移除。但是如果一个浏览器包含过期信息，这些浏览器将会等到过期时间到了才会更新。在这种情况下，更多的是从服务器中加载而不是最小丢失的浏览器调用。

## Init-Params

支持下边的Init-params

* `cacheName`由filter使用的在ehcache.xml中的名字

*  `blockingTimeoutMillis `以毫秒为单位的时间，在缓存丢失的情况下，过滤链等待返回相应的时间。

* `varyHeader`把vary设置为true：当需要GZIP压缩的时候在相应中设置Accept-Encoding。这个header需要支持http代理，但是默认它是关闭的。
{% highlight text %}
<init-param>
    <param-name>varyHeader</param-name>
    <param-value>true</param-value>
  </init-param>
{% endhighlight %}


## SimplePageFragmentCachingFilter

这个`SimplePageFragmentCachingFilter`可以做任何`SimplePageCachingFilter `可以做的事情，除非它不需要压缩，那么片段可以被包含进去。设置浏览器缓存头的过滤器是非常多样的，因为后者只适合缓存整个页面。

## web.xml中配置的例子

{% highlight xml %}
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee
version="2.5">

 <filter>
<filter-name>CachePage1CachingFilter</filter-name>
<filter-class>net.sf.ehcache.constructs.web.filter.SimplePageCachingFilter
</filter-class>
<init-param>
 <param-name>suppressStackTrace</param-name>
 <param-value>false</param-value>
</init-param>
<init-param>
 <param-name>cacheName</param-name>
 <param-value>CachePage1CachingFilter</param-value>
</init-param>
 </filter>

 <filter>
<filter-name>SimplePageFragmentCachingFilter</filter-name>    <filter-class>net.sf.ehcache.constructs.web.filter.SimplePageFragmentCachingFilter
</filter-class>
<init-param>
 <param-name>suppressStackTrace</param-name>
 <param-value>false</param-value>
</init-param>
<init-param>
 <param-name>cacheName</param-name>
 <param-value>SimplePageFragmentCachingFilter</param-value>
</init-param>
 </filter>

 <filter>
<filter-name>SimpleCachingHeadersPageCachingFilter</filter-name>    <filter-class>net.sf.ehcache.constructs.web.filter.SimpleCachingHeadersPageCachingFilter
</filter-class>
<init-param>
 <param-name>suppressStackTrace</param-name>
 <param-value>false</param-value>
</init-param>
<init-param>
 <param-name>cacheName</param-name>
 <param-value>CachedPage2Cache</param-value>
</init-param>
 </filter>

 <!-- This is a filter chain. They are executed in the order below.
      Do not change the order. -->

 <filter-mapping>
<filter-name>CachePage1CachingFilter</filter-name>
<url-pattern>/CachedPage.jsp</url-pattern>
<dispatcher>REQUEST</dispatcher>
<dispatcher>INCLUDE</dispatcher>
<dispatcher>FORWARD</dispatcher>
 </filter-mapping>

 <filter-mapping>
<filter-name>SimplePageFragmentCachingFilter</filter-name>
<url-pattern>/include/Footer.jsp</url-pattern>
 </filter-mapping>

 <filter-mapping>
<filter-name>SimplePageFragmentCachingFilter</filter-name>
<url-pattern>/fragment/CachedFragment.jsp</url-pattern>
 </filter-mapping>

 <filter-mapping>
<filter-name>SimpleCachingHeadersPageCachingFilter</filter-name>
<url-pattern>/CachedPage2.jsp</url-pattern>
 </filter-mapping>
{% endhighlight %}

一个ehcache.xml配置文件

{% highlight xml %}
<Ehcache xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xsi:noNamespaceSchemaLocation="../../main/config/ehcache.xsd">
<diskStore path="auto/default/path"/>
 <defaultCache
   maxEntriesLocalHeap="10"
   eternal="false"
   timeToIdleSeconds="5"
   timeToLiveSeconds="10">
   <persistence strategy="localTempSwap"/>
   />
  <!-- Page and Page Fragment Caches -->
<cache name="CachePage1CachingFilter"
  maxEntriesLocalHeap="10"
  eternal="false"
  timeToIdleSeconds="10000"
  timeToLiveSeconds="10000">
  <persistence strategy="localTempSwap"/>
</cache>
<cache name="CachedPage2Cache"
  maxEntriesLocalHeap="10"
  eternal="false"
  timeToLiveSeconds="3600">
  <persistence strategy="localTempSwap"/>
</cache>
<cache name="SimplePageFragmentCachingFilter"
  maxEntriesLocalHeap="10"
  eternal="false"
  timeToIdleSeconds="10000"
  timeToLiveSeconds="10000">
  <persistence strategy="localTempSwap"/>
</cache>
<cache name="SimpleCachingHeadersTimeoutPageCachingFilter"
  maxEntriesLocalHeap="10"
  eternal="false"
  timeToIdleSeconds="10000"
  timeToLiveSeconds="10000">
  <persistence strategy="localTempSwap"/>
</cache>
</ehcache>
{% endhighlight %}

原文中有两个章节未翻译，想了解全文的同学，可以看下边的链接。
原文地址：http://www.ehcache.org/documentation/2.8/modules/web-caching.html