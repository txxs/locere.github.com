---
layout: article
title: "后台框架构建（spring+Hibernate）"
modified:
categories: articles
excerpt: ""
comments: true
tags: []
image: 
  feature: 1600x800.gif.jpg
  teaser: 4002502.jpg
  thumb:
date: 2016-02-28T21:20:29+08:00
---

{% include toc.html %}

## 前言

前天和实验室的同学一起接了点私活，昨天写代码的时候，居然有点卡顿，很不好的现象呀，捋一捋它，发现后台的逻辑还是值得注意的，因此，在这里总结一下，主要是为了将来能够快速搭建一个更高效的框架。就从实现的顺序上来展开，重点在dao层：

## Controller

首先是一个service的注入

{% highlight java %}
	//接口利用接口回调的性质
	@Autowired
	private GuardianService guardianService;
	
	@RequestMapping("/*")
	public @ResponseBody AppResponse<String> guardian*(
			HttpServletRequest request) {

		Guardian guardian = guardianService.get(getUserId(request));
	}
{% endhighlight %}

##Service

顺序是先在GuardianService自己的实现中，去寻找实现，没有的话到接口中去，然后在接口的实现中找到它的实现。
下边是接口的内容它继承自BaseService

{% highlight java %}
public interface GuardianService extends BaseService<Guardian> {
	public Guardian getByUsername(String username);

	public List<Guardian> findByKidId(int kidId);

}
{% endhighlight %}

BaseService实现了抽象了绝大部分实现

{% highlight java %}

public interface BaseService<T extends BaseEntity> {

	public abstract T get(Serializable id);

	public abstract List<T> findAll();

	……

}
{% endhighlight %}

抽线service AbstractJpaService 实现了接口的BaseService的方法，而非基本的方法由GuardianServiceImpl等各自的实现类实现

{% highlight java %}
public abstract class AbstractJpaService<T extends BaseEntity> implements
		BaseService<T> {
	protected Logger logger = LoggerFactory.getLogger(this.getClass());

	@Autowired
	protected AbstractJpaDao<T> dao;

	public AbstractJpaDao<T> getDao() {
		return dao;
	}

	public void setDao(AbstractJpaDao<T> dao) {
		this.dao = dao;
	}

	@Override
	public T get(Serializable id) {
		return dao.get(id);
	}

	@Override
	public List<T> findAll() {
		return findAll("", true);
	}

	……
	}
{% endhighlight %}

## Dao

Dao采用的实现的方式和service差不多，但是要比service简单，一个实现类GuardianDao和一个它以及其它类抽象类

GuardianDao类

{% highlight java %}
@Repository
public class GuardianDao extends AbstractJpaDao<Guardian> {

	@Override
	protected Class<Guardian> getEntityClass() {
		return Guardian.class;
	}

	@Override
	protected Map<String, String> getSearchFields() {
		Map<String, String> searchFields = new HashMap<String, String>();
		searchFields.put("id", "=");
		searchFields.put("name", "like");
	……
	}

}
{% endhighlight %}

{% highlight java %}
public abstract class AbstractJpaDao<T extends BaseEntity> {
	protected Logger logger = LoggerFactory.getLogger(this.getClass());

	@PersistenceContext
	protected EntityManager em;

	protected abstract Class<T> getEntityClass();

	protected abstract Map<String, String> getSearchFields();

	protected String getAlias() {
		return "e";
	}

	public T get(Serializable id) {
		return em.find(getEntityClass(), id);
	}

	public List<T> findAll() {
		return findAll("", true);
	}

	public List<T> findAll(String order, boolean ascending) {
		return em.createQuery(buildQuery(null, false, order, ascending),
				getEntityClass()).getResultList();
	}

	public List<T> find(Map<String, Object> params, int start, int count,
			String order, boolean ascending) {
		TypedQuery<T> q = em.createQuery(
				buildQuery(params.keySet().iterator(), order, ascending),
				getEntityClass());
		setParameters(q, params);
		q.setFirstResult(start);
		q.setMaxResults(count > getMaxResults() ? getMaxResults() : count);
		return q.getResultList();
	}

	public List<T> find(Map<String, Object> params, String order,
			boolean ascending) {
		return find(params, 0, getMaxResults(), order, ascending);
	}
{% endhighlight %}

源码在百度云盘上