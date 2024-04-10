const first = document.querySelector('#number1');
const second = document.querySelector('#number2');

const result = document.querySelector('.result');

function long_run(x){
    console.log('long_run...',x)
  var a=0; 
  for(let i of [...Array(1e6).keys()]){ a+=Math.sqrt(i);}
  return a
}


if (window.Worker) {

	first.onchange = async function() {
	  //console.log('Message posted to worker');
        //await postData()
	}

	second.onchange = async function() {
	  console.log('Message posted to worker');
      await postData()
	}
    async function postData(){
      const myWorker = new Worker("worker.js");
	  myWorker.postMessage([first.value, second.value, {a:23,o:1}]);
        //profile performance 0
      long_run()
      let r = await new Promise(resolve=>{
            myWorker.onmessage = function(e) {
                resolve(e.data.r)
                console.log('Message received from worker');
                console.debug(e.data)
            }
      })
        //profile performance 1
     long_run()

     result.textContent = r;
    }


} else {
	console.log('Your browser doesn\'t support web workers.')
}
