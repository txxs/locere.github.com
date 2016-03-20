---
layout: article
title: "SpringMVC启动流程"
modified:
categories: articles
excerpt: ""
comments: true
tags: []
image: 
  feature: 1600x800.gif.jpg
  teaser: 4002502.jpg
  thumb:
date: 2016-03-20T08:51:29+08:00
---

{% include toc.html %}


## springMVC的启动过程1：

首先，对于一个web应用，其部署在web容器中，web容器提供其一个全局的上下文环境，这个上下文就是ServletContext，其为后面的spring IoC容器提供宿主环境；
  
其次，在web.xml中会提供有contextLoaderListener。在web容器启动时，会触发容器初始化事件，此时contextLoaderListener会监听到这个事件，其contextInitialized方法会被调用，在这个方法中，spring会初始化一个启动上下文，这个上下文被称为根上下文，即WebApplicationContext，这是一个接口类，确切的说，其实际的实现类是XmlWebApplicationContext。这个就是spring的IoC容器，其对应的Bean定义的配置由web.xml中的context-param标签指定。在这个IoC容器初始化完毕后，spring以WebApplicationContext.ROOTWEBAPPLICATIONCONTEXTATTRIBUTE为属性Key，将其存储到ServletContext中，便于获取；

再次，contextLoaderListener监听器初始化完毕后，开始初始化web.xml中配置的Servlet，这个servlet可以配置多个，以最常见的DispatcherServlet为例，这个servlet实际上是一个标准的前端控制器，用以转发、匹配、处理每个servlet请求。DispatcherServlet上下文在初始化的时候会建立自己的IoC上下文，用以持有spring mvc相关的bean。在建立DispatcherServlet自己的IoC上下文时，会利用WebApplicationContext.ROOTWEBAPPLICATIONCONTEXTATTRIBUTE先从ServletContext中获取之前的根上下文(即WebApplicationContext)作为自己上下文的parent上下文。有了这个parent上下文之后，再初始化自己持有的上下文。这个DispatcherServlet初始化自己上下文的工作在其initStrategies方法中可以看到，大概的工作就是初始化处理器映射、视图解析等。这个servlet自己持有的上下文默认实现类也是mlWebApplicationContext。初始化完毕后，spring以与servlet的名字相关(此处不是简单的以servlet名为Key，而是通过一些转换，具体可自行查看源码)的属性为属性Key，也将其存到ServletContext中，以便后续使用。这样每个servlet就持有自己的上下文，即拥有自己独立的bean空间，同时各个servlet共享相同的bean，即根上下文(第2步中初始化的上下文)定义的那些bean。

## 下边更详细的启动过程

### ServletContext

对于一个web应用，其部署在web容器中，web容器提供一个其一个全局的上下文环境，这个上下文环境就是ServletContext，它为后面的spring IoC容器提供宿主环境；

### ContextLoaderListener

web.xml中有配置ContextLoaderListener，也可以自定义一个实现ServletContextListener接口的Listener方法，web.xml中的配置实例如下：

{% highlight xml %}
<listener>

      <listener-class>com.manager.init.SystemInitListener</listener-class>

</listener>

<listener> 
　　
　　<listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>

</listener>
{% endhighlight %}

Web容器启动时触发ServletContextEvent事件，被contextLoaderListener监听到，并调用contextInitialized方法：

{% highlight java %}
/**

     * Initialize the root web application context.

   */

   public void contextInitialized(ServletContextEvent event) {

           this.contextLoader = createContextLoader();

           if (this.contextLoader == null) {

                 this.contextLoader = this;

           }

           this.contextLoader.initWebApplicationContext(event.getServletContext());

  }
{% endhighlight %}

这里调用ContextLoader中的initWebApplicationContext方法初始化WebApplicationContext，WebApplicationContext只是一个接口，默认的实现类是XmlWebApplicationContext。为什么是这个XmlWebApplicationContext？我们到ContextLoader中，看到有这么一段static代码块：

{% highlight java %}
static {

           // Load default strategy implementations from properties file.

           // This is currently strictly internal and not meant to be customized

           // by application developers.

           try {

                 ClassPathResource resource = new ClassPathResource(DEFAULT_STRATEGIES_PATH, ContextLoader.class);

                 defaultStrategies = PropertiesLoaderUtils.loadProperties(resource);

           }

           catch (IOException ex) {

                 throw new IllegalStateException("Could not load 'ContextLoader.properties': " + ex.getMessage());

           }

      }
{% endhighlight %}

ContextLoader.properties文件内容如下：

># Default WebApplicationContext implementation class for ContextLoader.

># Used as fallback when no explicit context implementation has been specified as context-param.

> # Not meant to be customized by application developers.

org.springframework.web.context.WebApplicationContext=org.springframework.web.context.support.XmlWebApplicationContext

这样就能根据属性文件中的定义反射出一个XmlWebApplicationContext上下文，也就是默认实现的WebApplicationContext.

再继续看怎么初始化XmlWebApplicationContext之前，我们需要意识到web.xml文件中有配置spring的Ioc容器，也就是：

{% highlight xml %}
<!-- The definition of the Root Spring Container shared by all Servlets and Filters -->

<context-param>

     <param-name>contextConfigLocation</param-name>

     <param-value>/WEB-INF/spring/root-context.xml</param-value>

</context-param>
{% endhighlight %}

接着就是进入到ContextLoader类中的initWebApplicationContext方法中，看它是怎么初始化的？

{% highlight java %}
public WebApplicationContext initWebApplicationContext(ServletContext servletContext) {

              //省略了很多前面的代码

              // Store context in local instance variable, to guarantee that

              // it is available on ServletContext shutdown.

              if (this.context == null) {

                     //初始化root WebApplicationContext, 采用默认的或者是用户指定的

                     this.context = createWebApplicationContext(servletContext);

              }

              if (this.context instanceof ConfigurableWebApplicationContext) {

                     ConfigurableWebApplicationContext cwac = (ConfigurableWebApplicationContext) this.context;

                     if (!cwac.isActive()) {

                            //省略部分代码

                            //获取contextConfigLocation指定的xml文件,customize the context

                            configureAndRefreshWebApplicationContext(cwac, servletContext);

                     }

              }

              //建立servletContext和WebApplicationContext之间的宿主关系

              servletContext.setAttribute(WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE, this.context);

       }

//省略部分代码

}
{% endhighlight %}

## 初始化servlet
初始化web.xml中配置的Servlet，这个servlet可以配置多个，最常见的是DispatcherServlet。web.xml中的配置如下图：

{% highlight xml %}
<servlet>
        <servlet-name>appServlet</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>/WEB-INF/spring/appServlet/appServlet-context.xml</param-value>
        </init-param>
        <load-on-startup>1</load-on-startup>
    </servlet>
{% endhighlight %}

这个servlet实际上是一个标准的前端控制器，用以转发、匹配、处理每个servlet请求。DispatcherServlet上下文在初始化的时候会建立自己的IoC上下文，用以持有spring mvc相关的bean。在建立DispatcherServlet自己的IoC上下文时，会利用WebApplicationContext.ROOTWEBAPPLICATIONCONTEXTATTRIBUTE先从ServletContext中获取之前的根上下文(即WebApplicationContext)作为自己上下文的parent上下文。有了这个parent上下文之后，再初始化自己持有的上下文。这个DispatcherServlet初始化自己上下文的工作在其initStrategies方法中可以看到，大概的工作就是初始化处理器映射、视图解析等。

{% highlight java %}
/**

 * Initialize the strategy objects that this servlet uses.

 * <p>May be overridden in subclasses in order to initialize further strategy objects.

       */

protected void initStrategies(ApplicationContext context) {

           initMultipartResolver(context);

           initLocaleResolver(context);

           initThemeResolver(context);

           initHandlerMappings(context);

           initHandlerAdapters(context);

           initHandlerExceptionResolvers(context);

           initRequestToViewNameTranslator(context);

           initViewResolvers(context);

           initFlashMapManager(context);

      }
{% endhighlight %}

这个servlet自己持有的上下文默认实现类也是XmlWebApplicationContext。初始化完毕后，spring以与servlet的名字相关(此处不是简单的以servlet名为Key，而是通过一些转换，具体可自行查看源码)的属性为属性Key，也将其存到ServletContext中，以便后续使用。这样每个servlet就持有自己的上下文，即拥有自己独立的bean空间，同时各个servlet共享相同的bean，即根上下文(第2步中初始化的上下文)定义的那些bean。


总结：控制流程配置在DispatcherServlet中，Spring bean的信息配置在ContextLoaderListener用于，创建bean的容器

[1] http://hi.baidu.com/df_world/item/e028d891f5383f1e924f414d

[2] spring的启动过程http://segmentfault.com/q/1010000000210417

[3] IOC是什么 http://www.cnblogs.com/DebugLZQ/archive/2013/06/05/3107957.html

[4] spring启动过程 http://gcq04552015.iteye.com/blog/1673530