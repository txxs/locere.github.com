# html5canvas
html5canvas核心技术学习记录


##Adding New Content with Octopress

&#160; &#160; &#160; &#160;该blog程序添加了octopress大量功能，想要使用请先安装octopress

{% highlight bash %} 
$ gem install octopress --pre 
{% endhighlight %}


### New Post

Default command

{% highlight bash %}
$ octopress new post "Post Title"
{% endhighlight %}

Default works great if you want all your posts in one directory, but if you're like me and want to group them into sub-folders like `/articles`, `/portfolio`, etc. Then this is the command for you. By specifying the DIR it will create a new post in that folder and populate `categories:` with the same value.

{% highlight bash %}
{% endhighlight %}

The default `_layout` used for new posts is `articles`. If you want to use the media layout or something else specify it like so

{% highlight bash %}
$ octopress new post "Portfolio Post Title" --dir portfolio --template media
{% endhighlight %}

### New Page

To create a new page use the following command.

{% highlight bash %}
$ octopress new page about/
{% endhighlight %}

This will create a page at `/about/index.md`

---

最后祝您身体健康，再见
