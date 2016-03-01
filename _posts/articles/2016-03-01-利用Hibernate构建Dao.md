---
layout: article
title: "利用Hibernate构建Dao"
modified:
categories: articles
excerpt: ""
comments: true
tags: []
image: 
  feature: 1600x800.gif.jpg
  teaser: 4002502.jpg
  thumb:
date: 2016-03-01T10:50:29+08:00
---

{% include toc.html %}

Dao层实现的就是增删改查，增加、更新和删除的形式基本固定，变化最多的就是查询，但是对于一些固定的操作，比如删除、增加和更新等，我们在实现的时候没有必要为每一个实体对应的Dao增加这些方法的实现，我们可以把它们抽象出来放在一个统一的类中处理，这样可以很大程度上提高代码的可用性。

## 定义实体基础类

{% highlight java %}
public abstract class BaseEntity {

	public abstract boolean isNew();

	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this);
	}

}
{% endhighlight %}

## 定义抽象Dao

在这个Dao中，将一些通用的操作，抽象出来

{% highlight java %}
public abstract class AbstractJpaDao<T extends BaseEntity> {
	protected Logger logger = LoggerFactory.getLogger(this.getClass());

	@PersistenceContext
	protected EntityManager em;

    //用于在子类中获取类的信息
	protected abstract Class<T> getEntityClass();
	protected abstract Map<String, String> getSearchFields();
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

	public T getSingleResult(Map<String, Object> params) {
		TypedQuery<T> q = em.createQuery(
				buildQuery(params.keySet().iterator(), "", true),
				getEntityClass());
		setParameters(q, params);
		q.setFirstResult(0);
		q.setMaxResults(getMaxResults());

		try {
			return q.getSingleResult();
		} catch (NoResultException e) {
			return null;
		}

	}

	private String buildCountQuery(Iterator<String> keys) {
		return buildQuery(keys, true, "", true);
	}

	private String buildQuery(Iterator<String> keys, String order,
			boolean ascending) {
		return buildQuery(keys, false, order, ascending);
	}


	public long count(Map<String, Object> params) {
		TypedQuery<Long> q = em.createQuery(buildCountQuery(params.keySet()
				.iterator()), Long.class);
		setParameters(q, params);
		return q.getSingleResult();
	}

	@SuppressWarnings("unchecked")
	public List<Object[]> executeQuery(String qlString,
			Map<String, Object> params) {
		Query q = em.createQuery(qlString);
		if (params != null) {
			for (String key : params.keySet()) {
				q.setParameter(key, params.get(key));
			}
		}
		q.setMaxResults(getMaxResults());
		return (List<Object[]>)q.getResultList();
	}

	public T save(T entity) {
		em.persist(entity);
		return entity;
	}

	public T update(T entity) {
		em.merge(entity);
		return entity;
	}

	public T delete(T entity) {
		em.remove(entity);
		return entity;
	}

	public T deleteById(Serializable id) {
		T entity = em.find(getEntityClass(), id);
		if (entity != null)
			em.remove(entity);
		return entity;
	}

}
{% endhighlight %}

## 具体Dao

每个类对应的具体的实现类，可以将类的信息传递到`AbstractJpaDao`中去

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
		searchFields.put("cardNo", "=");
		searchFields.put("mobile", "=");
		searchFields.put("username", "=");
		searchFields.put("school.id", "=");
		searchFields.put("kid.id", "=");
		searchFields.put("synStatus", "=");
		return searchFields;
	}

}
{% endhighlight %}

service在调用`AbstractJpaDao.get(id)`时是如何确定调用的哪个类的方法呢？

{% highlight java%}
	public T get(Serializable id) {
		return em.find(getEntityClass(), id);
	}
{% endhighlight %}

也就是如何确定`getEntityClass()`获取哪个类呢？在框架注入的时候就已经确定