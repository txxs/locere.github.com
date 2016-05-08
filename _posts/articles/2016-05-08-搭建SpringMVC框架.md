---
layout: article
title: "搭建SpringMVC框架"
modified:
categories: articles
excerpt: ""
comments: true
tags: []
image: 
  feature: 1600x800.gif.jpg
  teaser: 4002502.jpg
  thumb:
date: 2016-05-08T12:57:29+08:00
---

{% include toc.html %}

{% highlight xml %}

{% endhighlight %}

web.xml

{% highlight xml %}

<?xml version="1.0" encoding="UTF-8"?>
<web-app id="teamlucky" version="2.5" xmlns="http://java.sun.com/xml/ns/j2ee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/j2ee/web-app_2_5.xsd">
    <display-name>gamesvr</display-name>
    <welcome-file-list>
        <welcome-file>index</welcome-file>
    </welcome-file-list>

    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>
            /WEB-INF/spring/spring-dataSource.xml
            /WEB-INF/spring/spring-beans.xml
        </param-value>
    </context-param>
	
	<!-- Spring监听器 -->
    <listener>
        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
    </listener>
    <!-- 防止Spring内存溢出监听器 -->
    <listener>
        <listener-class>org.springframework.web.util.IntrospectorCleanupListener</listener-class>
    </listener>
	
	<!-- Spring MVC servlet -->
    <servlet>
        <servlet-name>springDispatcherServlet</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>/WEB-INF/spring/spring-mvc.xml</param-value>
        </init-param>
        <load-on-startup>1</load-on-startup>
    </servlet>
    <servlet-mapping>
        <servlet-name>springDispatcherServlet</servlet-name>
        <url-pattern>*.do</url-pattern>
    </servlet-mapping>
    <servlet-mapping>
        <servlet-name>springDispatcherServlet</servlet-name>
        <url-pattern>/index</url-pattern>
    </servlet-mapping>

    <!-- 编码过滤器 -->
    <filter>
        <filter-name>characterEncodingFilter</filter-name>
        <filter-class>org.springframework.web.filter.CharacterEncodingFilter</filter-class>
        <!--<async-supported>true</async-supported>-->
        <init-param>
            <param-name>encoding</param-name>
            <param-value>UTF-8</param-value>
        </init-param>
    </filter>
    <filter-mapping>
        <filter-name>characterEncodingFilter</filter-name>
        <url-pattern>*.do</url-pattern>
    </filter-mapping>
    <filter-mapping>
        <filter-name>characterEncodingFilter</filter-name>
        <url-pattern>/index</url-pattern>
    </filter-mapping>

    <!-- 是否登录拦截器 -->
    <filter>
        <filter-name>checkLoginFilter</filter-name>
        <filter-class>
            com.gamesvr.framework.filter.CheckLoginFilter
        </filter-class>
        <init-param>
            <param-name>excludeUrl</param-name>
            <param-value>
                /goSignIn.do
                /doSignIn.do
                /error.do
            </param-value>
        </init-param>
    </filter>
    <filter-mapping>
        <filter-name>checkLoginFilter</filter-name>
        <url-pattern>*.do</url-pattern>
    </filter-mapping>
    <filter-mapping>
        <filter-name>checkLoginFilter</filter-name>
        <url-pattern>/index</url-pattern>
    </filter-mapping>


    <filter>
        <filter-name>adminFilter</filter-name>
        <filter-class>
            com.gamesvr.framework.filter.AdminFilter
        </filter-class>
    </filter>
    <filter-mapping>
        <filter-name>adminFilter</filter-name>
        <url-pattern>/admin/*</url-pattern>
    </filter-mapping>

    <!-- Spring MVC配置结束 -->

    <servlet>
        <servlet-name>InitServlet</servlet-name>
        <servlet-class>com.gamesvr.framework.servlet.InitServlet</servlet-class>
        <load-on-startup>2</load-on-startup>
    </servlet>

	<!-- 配置超时-->
    <session-config>
        <session-timeout>1000</session-timeout>
    </session-config>
</web-app>

{% endhighlight %}

spring-dataSource.xml

{% highlight xml %}

<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:aop="http://www.springframework.org/schema/aop"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:mvc="http://www.springframework.org/schema/mvc" xmlns:p="http://www.springframework.org/schema/p"
       xmlns:task="http://www.springframework.org/schema/task" xmlns:tx="http://www.springframework.org/schema/tx"
       xmlns:util="http://www.springframework.org/schema/util"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.1.xsd
		http://www.springframework.org/schema/aop http://www.springframework.org/schema/aop/spring-aop-4.1.xsd
		http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-4.1.xsd
		http://www.springframework.org/schema/mvc http://www.springframework.org/schema/mvc/spring-mvc-4.1.xsd
		http://www.springframework.org/schema/task http://www.springframework.org/schema/task/spring-task-4.1.xsd
		http://www.springframework.org/schema/tx http://www.springframework.org/schema/tx/spring-tx-4.1.xsd
		http://www.springframework.org/schema/util http://www.springframework.org/schema/util/spring-util-4.1.xsd">

    <context:property-placeholder location="/WEB-INF/properties/jdbc.properties,/WEB-INF/properties/app.properties"
                                  local-override="true"/>

    <bean id="dataSource" class="com.mchange.v2.c3p0.ComboPooledDataSource" destroy-method="close">
        <property name="driverClass" value="${jdbc.driverClass}"></property>
        <property name="jdbcUrl" value="${jdbc.jdbcUrl}"></property>
        <property name="user" value="${jdbc.user}"></property>
        <property name="password" value="${jdbc.password}"></property>
        <!-- 当连接池中的连接耗尽的时候c3p0一次同时获取的连接数 -->
        <property name="acquireIncrement" value="${jdbc.acquireIncrement}">
        </property>
        <!-- 初始化时获取连接个数 -->
        <property name="initialPoolSize" value="${jdbc.initialPoolSize}">
        </property>
        <!-- 最大空闲时间,30秒内未使用则连接被丢弃。若为0则永不丢弃 -->
        <property name="maxIdleTime" value="${jdbc.maxIdleTime}"></property>
        <!-- 连接池中保留的最大连接数 -->
        <property name="maxPoolSize" value="${jdbc.maxPoolSize}"></property>
        <!-- 连接池中保留的最小连接数 -->
        <property name="minPoolSize" value="${jdbc.minPoolSize}"></property>
        <!-- 两次连接中间隔时间，单位毫秒 -->
        <property name="acquireRetryDelay" value="${jdbc.acquireRetryDelay}"></property>
        <!-- 定义在从数据库获取新连接失败后重复尝试的次数 -->
        <property name="acquireRetryAttempts" value="${jdbc.acquireRetryAttempts}"></property>
        <!-- 获取连接失败将会引起所有等待连接池来获取连接的线程抛出异常。但是数据源仍有效 保留，并在下次调用getConnection()的时候继续尝试获取连接。如果设为true，那么在尝试
            获取连接失败后该数据源将申明已断开并永久关闭。Default: false -->
        <property name="breakAfterAcquireFailure" value="${jdbc.breakAfterAcquireFailure}"></property>
    </bean>

    <!-- 定义容器中用到的JNDI连接池名称 -->
    <!-- 如果使用TOMCAT，需要加上前缀: java:comp/env/ -->
    <!-- <bean id="dataSource" class="org.springframework.jndi.JndiObjectFactoryBean">
        <property name="jndiName">
            <value>java:comp/env/jdbc/DC</value>
        </property>
    </bean> -->

    <bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
        <!--dataSource属性指定要用到的连接池 -->
        <property name="dataSource" ref="dataSource"/>
        <!--configLocation属性指定mybatis的核心配置文件 -->
        <property name="configLocation" value="/WEB-INF/mybatis/mybatis-config.xml"/>
        <!-- 所有配置的mapper文件 -->
        <property name="mapperLocations">
            <array>
                <value>classpath*:mybatis/mapper/*.xml</value>
            </array>
        </property>
    </bean>

    <bean class="org.mybatis.spring.mapper.MapperScannerConfigurer">
        <property name="basePackage" value="com.gamesvr"/>
    </bean>

    <!-- 启动对@AspectJ注解的支持 -->
    <context:annotation-config />

    <!-- 自动扫描组件，这里要把controler下面的 controller去除，他们是在spring3-servlet.xml中配置的，如果不去除会影响事务管理的-->
    <context:component-scan base-package="com.gamesvr">
        <context:exclude-filter type="annotation" expression="org.springframework.stereotype.Controller" />
    </context:component-scan>

    <!-- 配置事务 -->
    <bean id="txManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
        <property name="dataSource" ref="dataSource" />
    </bean>

    <!-- 事务控制位置，一般在业务层service -->
    <aop:config>
        <aop:pointcut id="fooServiceMethods" expression="execution(* com.gamesvr.service.impl.*.*(..))"/>
        <aop:advisor advice-ref="txAdvice" pointcut-ref="fooServiceMethods"/>
    </aop:config>
    <tx:advice id="txAdvice" transaction-manager="txManager">
        <tx:attributes>
            <tx:method name="get*" propagation="REQUIRED" read-only="true" />
            <tx:method name="find*" propagation="REQUIRED" read-only="true" />
            <tx:method name="query*" propagation="REQUIRED" read-only="true" />
            <tx:method name="load*" propagation="REQUIRED" read-only="true" />
            <tx:method name="*Query" propagation="REQUIRED" read-only="true" />
            <tx:method name="*Count" propagation="REQUIRED" read-only="true" />
            <tx:method name="*" propagation="REQUIRED" rollback-for="Exception"/>
        </tx:attributes>
    </tx:advice>
    <!-- 配置事务结束 -->

    <aop:aspectj-autoproxy />
    <!-- 业务AOP开始 -->
    <bean id="operLogAdvice" class="com.gamesvr.aop.OperLogAspect">
        <property name="operLogService"><ref bean="operLogService" /> </property>
    </bean>
</beans>

{% endhighlight %}

spring-beans.xml

{% highlight xml %}

<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.1.xsd">

    <bean id="sysUserService" class="com.gamesvr.service.impl.SysUserServiceExt">
        <property name="sysUserDao" ref="sysUserDao" />
    </bean>
    <bean id="gameInfoService" class="com.gamesvr.service.impl.GameInfoServiceExt">
        <property name="gameInfoDao" ref="gameInfoDao" />
    </bean>
    <bean id="serverInfoService" class="com.gamesvr.service.impl.ServerInfoServiceExt">
        <property name="serverInfoDao" ref="serverInfoDao" />
    </bean>
    <bean id="gameServerService" class="com.gamesvr.service.impl.GameServerServiceExt">
        <property name="gameServerDao" ref="gameServerDao" />
    </bean>
    <bean id="newsService" class="com.gamesvr.service.impl.NewsServiceExt">
        <property name="newsDao" ref="newsDao" />
    </bean>
    <bean id="operLogService" class="com.gamesvr.service.impl.OperLogServiceExt">
        <property name="operLogDao" ref="operLogDao" />
    </bean>
    
    <bean id="avatarService" class="com.gamesvr.service.impl.AvatarService">
        <property name="rootPath" value="${app.file_root_path}" />
    </bean>
    
    <bean id="messageRecieveHandler" class="com.gamesvr.minaenpo.MessageRecieveHandler">
    </bean>
    
    <bean id="gameClient" class="com.gamesvr.minaclient.GameClient">
    </bean>
    
    <bean id="gameClientHandler" class="com.gamesvr.minaclient.GameClientHandler">
        <property name="gameClient" ref="gameClient" />
        <property name="messageRecieveHandler" ref="messageRecieveHandler" />
    </bean>
        
    <bean id="connectHost" class="com.gamesvr.minaenpo.ConnectHost">
         <property name="gameClientHandler" ref="gameClientHandler" />
    </bean>
</beans>

{% endhighlight %}

spring-mvc.xml

{% highlight xml %}

<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:aop="http://www.springframework.org/schema/aop"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:mvc="http://www.springframework.org/schema/mvc" xmlns:p="http://www.springframework.org/schema/p"
       xmlns:task="http://www.springframework.org/schema/task" xmlns:tx="http://www.springframework.org/schema/tx"
       xmlns:util="http://www.springframework.org/schema/util"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.1.xsd
		http://www.springframework.org/schema/aop http://www.springframework.org/schema/aop/spring-aop-4.1.xsd
		http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-4.1.xsd
		http://www.springframework.org/schema/mvc http://www.springframework.org/schema/mvc/spring-mvc-4.1.xsd
		http://www.springframework.org/schema/task http://www.springframework.org/schema/task/spring-task-4.1.xsd
		http://www.springframework.org/schema/tx http://www.springframework.org/schema/tx/spring-tx-4.1.xsd
		http://www.springframework.org/schema/util http://www.springframework.org/schema/util/spring-util-4.1.xsd">

    <!--通知spring使用cglib而不是jdk的来生成代理方法 AOP可以拦截到Controller -->
    <aop:aspectj-autoproxy proxy-target-class="true"/>

    <!-- 扫描所有的controller 但是不扫描service-->
    <context:component-scan base-package="com.gamesvr">
        <context:include-filter type="annotation" expression="org.springframework.stereotype.Controller" />
        <context:exclude-filter type="annotation" expression="org.springframework.stereotype.Service" />
    </context:component-scan>

    <!-- 默认注解的支持，相当于注册了DefaultAnnotationHandlerMapping和AnnotationMethodHandlerAdapter，用于拦截请求，解析参数，然会结果转换等功能 -->
    <!-- <mvc:annotation-driven /> -->
    <bean id="byteArrayHttpMessageConverter"
          class="org.springframework.http.converter.ByteArrayHttpMessageConverter"></bean>
    <bean id="formHttpMessageConverter" class="org.springframework.http.converter.FormHttpMessageConverter"></bean>
    <bean id="resourceHttpMessageConverter"
          class="org.springframework.http.converter.ResourceHttpMessageConverter"></bean>
    <bean id="jacksonMessageConverter"
          class="org.springframework.http.converter.json.MappingJackson2HttpMessageConverter"></bean>
    <bean class="org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter">
        <property name="messageConverters">
            <util:list id="beanList">
                <ref bean="byteArrayHttpMessageConverter"/>
                <ref bean="formHttpMessageConverter"/>
                <ref bean="resourceHttpMessageConverter"/>
                <ref bean="jacksonMessageConverter"/>
            </util:list>
        </property>
        <property name="webBindingInitializer">
            <bean class="org.springframework.web.bind.support.ConfigurableWebBindingInitializer">
                <property name="conversionService">
                    <bean class="org.springframework.format.support.FormattingConversionServiceFactoryBean"></bean>
                </property>
            </bean>
        </property>
    </bean>

    <bean class="org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping"></bean>
    <bean class="org.springframework.web.servlet.mvc.method.annotation.ExceptionHandlerExceptionResolver"></bean>

    <!-- 静态资源访问 -->
    <mvc:resources mapping="/resource/**" location="/resource/" cache-period="31556926"/>

    <!-- 配置拦截器 -->
    <!-- 定义跳转的文件的前后缀 ，视图模式配置-->
    <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
        <!-- 这里的配置我的理解是自动给后面action的方法return的字符串加上前缀和后缀，变成一个 可用的url地址 -->
        <property name="viewClass" value="org.springframework.web.servlet.view.JstlView"/>
        <property name="prefix" value="/WEB-INF/pages"/>
        <property name="suffix" value=".jsp"/>
    </bean>

    <!-- 全局异常配置 start -->
    <bean id="exceptionResolver" class="org.springframework.web.servlet.handler.SimpleMappingExceptionResolver">
        <property name="exceptionMappings">
            <props>
                <prop key="java.lang.Exception">/errors/error</prop>
                <prop key="java.lang.Throwable">/errors/err</prop>
            </props>
        </property>
        <property name="statusCodes">
            <props>
                <prop key="errors/error">500</prop>
                <prop key="errors/404">404</prop>
            </props>
        </property>
        <!-- 设置日志输出级别，不定义则默认不输出警告等错误日志信息 -->
        <property name="warnLogCategory" value="WARN"></property>
        <!-- 默认错误页面，当找不到上面mappings中指定的异常对应视图时，使用本默认配置 -->
        <property name="defaultErrorView" value="errors/error"></property>
        <!-- 默认HTTP状态码 -->
        <property name="defaultStatusCode" value="500"></property>
    </bean>
    <!-- 全局异常配置 end -->

    <!-- 支持上传文件 -->
    <bean id="multipartResolver" class="org.springframework.web.multipart.commons.CommonsMultipartResolver">
        <!-- 默认编码 -->
        <property name="defaultEncoding" value="utf-8"/>
        <!-- 文件大小最大值 -->
        <property name="maxUploadSize" value="10485760000"/>
        <!-- 内存中的最大值 -->
        <property name="maxInMemorySize" value="40960"/>
    </bean>
</beans>

{% endhighlight %}

app.properties

{% highlight xml %}

app.file_root_path=/Users/laiguoqiang/Work/OutPut/Doc/

{% endhighlight %}

jdbc.properties


{% highlight xml %}

jdbc.driverClass=com.mysql.jdbc.Driver
jdbc.jdbcUrl=jdbc:mysql://localhost:3306/gamesvr?useUnicode=true&characterEncoding=utf-8
jdbc.user=root
jdbc.password=root

jdbc.acquireIncrement=1
jdbc.initialPoolSize=1
jdbc.maxIdleTime=600
jdbc.maxPoolSize=100
jdbc.minPoolSize=10
jdbc.acquireRetryDelay=1000
jdbc.acquireRetryAttempts=3
jdbc.breakAfterAcquireFailure=false

{% endhighlight %}



