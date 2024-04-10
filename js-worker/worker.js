async function test(e){
  console.log('Worker: Message received from main script');
    console.log(e.data)
  let result = e.data[0] * e.data[1]+100;
  if (isNaN(result)) {
    postMessage('Please write two numbers');
  } else {
    let workerResult = 'Result: ' + result;
    console.log('Worker: Posting message back to main script');
     var func = (a,b)=>{
          return a+b
      }
      await new Promise(resolve=>{
          setTimeout(()=>{
              let o = {}
              o.__proto__.worker=1
              var a= long_run()
              var out = {r:workerResult,o,func:[1,2,3], a:a,b:1e2}
              console.log(out,a)
              postMessage(out);
          }, 500)
      })
  }

}

function long_run(){
  var a=0; 
  for(let i of [...Array(1e7).keys()]){ a+=Math.sqrt(i);}
  return a
}
onmessage = function(e) {
    test(e)
}
