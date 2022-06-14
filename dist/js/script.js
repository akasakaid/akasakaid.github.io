// headers
window.onscroll = function(){
    const atasmine = document.querySelector('header');
    const sizeNav = atasmine.offsetTop;

    if (window.pageYOffset > sizeNav){
        atasmine.classList.add('navbar-fixed');
    } else {
        atasmine.classList.remove('navbar-fixed');
    }
};

// hamburger menu
const hamburger = document.querySelector("#hamburger");
const navmenu = document.querySelector("#menu");
hamburger.addEventListener('click',function(){
    hamburger.classList.toggle('hamburger-active');
    navmenu.classList.toggle('hidden')

});