# serverless 平台方案
> arch/lambda/lambda-platform.md
Serverless(以lambda,aws　function )特点：
1. 自动扩展资源
2. 无服务器管理：开发者不需要关心server运行维护
3. 按需付费

Deno Deploy是Deno公司的一个产品，它是一个全球分布式的JavaScript、TypeScript运行环境，类似于Cloudflare Workers或AWS Lambda

 @陈天 在 27:39 展示了两种比container更轻量的serveless架构 https://www.bilibili.com/video/BV1Xg41117Pm/
- V8 isolate(use Deno)
- WASM

# deno deploy 介绍
> https://www.reddit.com/r/Deno/comments/18o7c84/what_container_does_deno_deploy_use/

Deno 的 Isolate 是基于 V8 的 Isolate，它是 Deno 运行时的基础组件，用于执行 JavaScript 代码。在 Deno 中，不能直接创建一个 Isolate，因为 Deno 运行时会为每个执行的脚本自动创建一个 Isolate。

此外, 可以使用 Deno 的 Worker API 来创建一个新的执行环境，这个执行环境在一个新的 Isolate 中运行，与主线程是隔离的。

## How does Deno deploy isolate(differ from v8 isolates)
> https://www.reddit.com/r/Deno/comments/18o7c84/what_container_does_deno_deploy_use/
How to start Deno Workers with **resource limit** like Deno Deploy?

### Cloudflare Workers implement
Kenton Varda did a presentation on **V8 Isolates** where he talks about **resource limits** at 18:18 of https://www.youtube.com/watch?v=HK04UxENH10

1. Memory usage is monitored using the `isolate.GetHeapStatistics()` method. Isolates that go over the limit are given a small grace period to reduce their memory or they're killed.
2. CPU usage is limited using a timer`timer_create(CLOCK_THREAD_CPUTIME_ID)`. When the timer runs out, the **isolate is killed**.

If you want to do something like this, you should embed Deno in your application and control the isolates in rust. You can use `deno_core`, and the deno op crates to embed deno in your application.

### Deno deploy implement
I found an article: https://deno.com/blog/anatomy-isolate-cloud , and it mentions:

- **Running deployments in separate processes.** 
V8 isolates are already… isolated… from one another. Deno Deploy goes a step further and enlists the operating system’s help to improve the isolation of each deployment.

- **Hypervisor monitoring of resource utilization.**
The runner continuously tracks the metrics of all running deployments. This is necessary for billing purposes, but also allows the runner to enforce resource utilization quotas. Deployments that consume too many resources are terminated to prevent service degradation.

## V8 isolate create step
resource:
1. Interaction with V8: 
 https://denolib.gitbook.io/guide/advanced/interaction-with-v8 https://github.com/denolib/guide
2. How to use v8 isolates in Rust using rusty_v8: 
 https://www.youtube.com/watch?v=ZzbmcQv-VJc

1.Creating V8 Platform

    // From src/main.rs, we would find these 2 lines of code:
    let snapshot = snapshot::deno_snapshot();
    let isolate = isolate::Isolate::new(snapshot, state, ops::dispatch);

This is where the V8 isolate is created. 

    //Going into the definition of Isolate::new in src/isolate.rs:
    pub fn new(
        snapshot: libdeno::deno_buf,
        state: Arc<IsolateState>,
        dispatch: Dispatch,
      ) -> Self {
        DENO_INIT.call_once(|| {
          unsafe { libdeno::deno_init() };
        });
        let config = libdeno::deno_config {
          will_snapshot: 0,
          load_snapshot: snapshot,
          shared: libdeno::deno_buf::empty(),
          recv_cb: pre_dispatch, // callback to invoke when Rust receives a message
        };
        ...
      }


# Deno Worker 资源控制
> v8 的worker 是多线程的

## worker 资源展示
Show current page usage via this API(chrome/deno): 不支持展示worker 资源占用

    'cpu num': navigator.hardwareConcurrency, // int
    'window.performance': window.performance, // Performance { timeOrigin: 1728880953246 } //显示当前页面性能相关的信息，如页面加载时间、导航时间等

方案，利用deno run -A worker.ts 启动进程(参考deno-run.md), 直接观察进程的cpu/mem/network

## 限制worker的 cpu/mem
限制worker 的cpu/mem　的方法还有讨论中:
- cpu limit per isolate worker: https://github.com/denoland/deno/discussions/12626
    - deno_core create deno runtime manually: https://crates.io/crates/deno_core

如果要限制worker　cpu/mem,　目前要自己改造deno. 或者使用deno run进程的方式

