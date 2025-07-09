/**
 * This takes a page Name and loads a file 
 * with that name in pages folder, it will loaded in main in index.html
 * @param {String} page 
 */
function switchPage(page) {
    $.ajax({
        url: `/pages/${page}.html`,
        method: "GET",
        dataType: "html",
        success: (data) => {
            $("main").html(data);
            history.pushState(null, '', `/pages/${page}.html`);
            localStorage.setItem("lastPage", page);

            $("title").text(titleCase(page));
        },
        error: function (error) {
            let message = "Sorry! The Page did not load!";
            $("main").text(message);
        }
    })
}
/**
 * Return a title case item
 * @param {String} item 
 * @returns 
 */
function titleCase(item){
    return item[0].toUpperCase() + item.slice(1,item.length);
}
/**
 * This will excute when the document is fulley loaded
 */
$(document).ready(() => {
    // By default the Home page will be loaded first 
    if (localStorage.getItem("lastPage") === null) {
        localStorage.setItem("lastPage", "home");
        switchPage("home","Home");
    } else {
        switchPage(localStorage.getItem("lastPage"),titleCase(localStorage.getItem("lastPage")))
    }
    // This adds a click event to the nav button; which calls switchPage with the button text
    $(".links button").click((e) => {
        // E is a event, target is the button, page is in attribute route
        let route = e.target.getAttribute("routes");
        switchPage(route);
    })
})