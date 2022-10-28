import "core-js";

import count from "./js/count";
import sum from "./js/sum";
import { add } from "./js/math"

import "./css/index.css";
import "./less/common.less";
import "./scss/test1.scss";
import "./scss/test2.scss";
import "./stylus/index.styl";
import "./css/iconfont.css";

console.log(add(2, 1));
console.log(count(2, 1));
console.log(sum(4, 3, 2, 1));

// var res1 = count(3, 2, 1)
// console.log(res1);
// var res2 = sum(4,3, 2, 1)
// console.log(res2);


new Promise((resolve) => {
    setTimeout(() => {
        resolve()
    }, 1000);
})

const arr = [1, 2, 3, 4]
console.log(arr.includes(1));

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('SW registered: ', registration);
        }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}