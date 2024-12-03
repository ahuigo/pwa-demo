const worker = new Worker(new URL("./worker.ts", import.meta.url).href, {
  type: "module",
});

worker.postMessage({ cmd: "start" });
/*
 * 1. How to limit worker's cpu and memory?
 * 2. How to view worker's cpu and memory?
 */
//worker.terminate();


worker.onmessage = (event) => {
  console.log("main:worker result:", event.data);
  console.log("main:worker result.extra:", event.data.extra);
  const resource = {
    'cpu num': navigator.hardwareConcurrency, // int
    'window.performance': window.performance, // Performance { timeOrigin: 1728880953246 }
  };
  console.log({ main: resource });
};

worker.onerror = (error) => {
  console.error("Worker error:", error);
};
