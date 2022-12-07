const get = document.getElementById('get');
const post = document.getElementById('addperson-form');

// Call doSomething function when click
get.addEventListener('click', () => {
    indexBridge.doSomething()
})

// Call postPerson function when submit
post.addEventListener('submit', (e) => {
    e.preventDefault()
    indexBridge.postPerson()
})