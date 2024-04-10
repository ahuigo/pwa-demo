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
  console.log("worker res:", event.data);
  console.log("worker res2:", event.data.extra);
};

worker.onerror = (error) => {
  console.error("Worker error:", error);
};
