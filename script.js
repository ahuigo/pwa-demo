const buttons = document.querySelectorAll(".btn");

buttons.forEach((btn,index) => {
  btn.addEventListener("click", ()=> {
    var listItems = document.querySelectorAll(".list-items")[0];
    var item = document.createElement("div");
    item.className = (listItems.children.length % 2 === 0) ? 'odd' : 'even';
    item.innerHTML = 'item ' + String(listItems.children.length + 1);
    listItems.appendChild(item);
  });
});
// TODO: add button to update new version (clean old cache)
async function detectSWUpdate() {
    const registration = await navigator.serviceWorker.ready;
    registration.addEventListener("updatefound", event => {
        const newSW = registration.installing;
        newSW.addEventListener("statechange", event => {
            if (newSW.state == "installed") {
                // New service worker is installed, but waiting activation
            }
        });
    });
}

// https://web.dev/learn/pwa/service-workers/
/*
Scope:
    A service worker that lives at example.com/my-pwa/serviceworker.js can control any navigation at the my-pwa path or below, such as example.com/my-pwa/demos/. Service workers can only control items (pages, workers, collectively "clients") in their scope.
    Only one service worker per scope is allowed.
    You should set the scope of your service worker as close to the root of your app as possible
*/
if ('serviceWorker' in navigator) {
   navigator.serviceWorker.register("./serviceworker.js",{
        scope: '.' // <--- THIS BIT IS REQUIRED
    }).then(function(registration) {
        // Registration was successful
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
        // registration failed :(
        console.log('ServiceWorker registration failed: ', err);
    });
}
