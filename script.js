(function () {
    const pagesData = [];
    let cities = [], isPopState = false;

    /**
     * This function switches the page based on the provided page name.
     * @param {String} page 
     * @returns 
     */
    function switchPage(page) {
        const isPageDes = page.includes("des");
        const existPage = findPageIndex(page, isPageDes);
        page = page.includes("index") ? "home" : page;
        if (existPage !== -1) {
            renderCachedPage(page, isPageDes, existPage);
            return;
        }

        fetchAndRenderPage(page, isPageDes);
    }
    /**
     * Finds if the page exists in the cached pages data.
     * @param {String} page 
     * @param {Boolean} isPageDes 
     * @returns 
     */
    function findPageIndex(page, isPageDes) {
        return pagesData.findIndex((item) => {
            return Object.keys(item)[0].includes(isPageDes ? "destinations" : page);
        });
    }
    /**
     * If the page exists in the cache, this function renders it from the array, pagesData.
     * @param {String} page 
     * @param {Boolean} isPageDes 
     * @param {Boolean} existPage 
     */
    function renderCachedPage(page, isPageDes, existPage) {
        $("main").html(pagesData[existPage][isPageDes ? "destinations" : page]);
        if (isPageDes) {
            handleDestinationPage(page);
        } else {
            handleRegularPage(page);
        }
        localStorage.setItem("lastPage", page);
        attachLinkBtnHandlers();
    }
    /**
     * Fetchs the page from the pages directory and renders it.
     * @param {String} page 
     * @param {Boolean} isPageDes 
     */
    function fetchAndRenderPage(page, isPageDes) {
        try {
            $.ajax({
                url: `/pages/${isPageDes ? "destinations" : page}.html`,
                method: "GET",
                dataType: "html",
                success: (data) => {
                    $("main").html(data);
                    localStorage.setItem("lastPage", page);
                    if (isPageDes) {
                        handleDestinationPage(page);
                    } else {
                        handleRegularPage(page);
                    }
                    attachLinkBtnHandlers();
                    pagesData.push({ [isPageDes ? "destinations" : page]: data });
                },
                error: function () {
                    $("main").text("Sorry! The Page did not load!");
                }
            });
        } catch (err) {
            console.log(err);
        }
    }
    /**
     * This handles the destination page by extracting the city name from the page string.
     * @param {String} page 
     */
    function handleDestinationPage(page) {
        let cityName = page.slice(4);
        const itemD = cities.find((val) => val.cityName.includes(cityName));
        if (itemD === undefined) {
            let error = $("<h1>");
            error.text("This destiniations does not exist!");
            $("main").html(error);
            throw new Error("City does not exist");
        }
        desCityBuilder(cityName);
        if (isPopState) {
            history.pushState({ page: 'destinations', id: cityName }, '', `/pages/destinations.html?city=${cityName}`);
        }
        isPopState = true;
        $("title").text(titleCase(cityName));
    }
    /**
     * Handles the regular pages 
     * @param {String} page 
     */
    function handleRegularPage(page) {
        if (isPopState) {
            history.pushState({ "pages": page }, '', `/pages/${page}.html`);
        }
        isPopState = true;
        $("title").text(titleCase(page));
    }
    /**
     * Attaches click event handlers to all elements with the class 'link-btn'.
     */
    function attachLinkBtnHandlers() {
        $(".link-btn").each(function (ind, ele) {
            $(ele).off("click").on("click", function (e) {
                switchPageClickEffect(e.target.getAttribute("routes"));
            });
        });
    }
    /**
     * Return a title case item
     * @param {String} item 
     * @returns 
     */
    function titleCase(item) {
        return item[0].toUpperCase() + item.slice(1, item.length);
    }
    /**
     * This fills the destinations page with a item also fills the wonder
     * @param {Object} item 
     */
    function desCityBuilder(item) {
        const itemD = cities.find((val) => val.cityName.includes(item)),
            crumbs = $("<h5/>").text(itemD.cityName).addClass("text-accent underline bold");
        let index = cities.indexOf(itemD);
        //$(".des-banner").attr("src", itemD.cityBannerImg);
        $(".des-head").text(itemD.cityName);
        $(".des-description").text(itemD.cityDescription)
        $(".des-loc").text(itemD.cityLoc)
        $(".des-attr").text(itemD.cityAttribute)
        $(".des-crumbs").append(crumbs);
        $(".city-Name").text(itemD.cityName)
        $(".des-large").attr("src", itemD.cityLargeImg)
        // Builds Wonders
        const wonders = itemD.cityWonders;
        const wondersEle = wonders.map((item) => {
            let container = $("<div>").addClass("rounded-xl p-3 text-white flex flex-col items-center space-y-2 size-full mx-auto shadow-sm bg-primary/50 xl:px-2 xl:py-2 xl:mx-0"),
                textContainer = $("<div>").addClass("p-2 flex flex-col space-y-2"),
                name = $("<h4/>").addClass("text-lx font-bold xl:text-2xl").text(item.wonderName),
                img = $("<img/>").addClass("rounded-xl object-cover size-full xl:w-[30rem] xl:h-[20rem] aspect-square shadow-sm ").attr("src", item.wonderImg),
                description = $("<p>").addClass("text-sm xl:text-lg xl:w-[20rem] font-light").text(item.wonderDescription);
            textContainer.append(name, description)
            container.append(img, textContainer);
            return container
        });
        for (var item of wondersEle) {
            $(".des-wonder").append(item)
        }
        // Builds tops stuff based on cityTop Keys
        Object.keys(itemD.cityTop).forEach((item, index) => {
            $("." + item).text(Object.values(itemD.cityTop)[index]).addClass(" p-2 xl:p-3")
        })
        index = (index + 3) >= cities.length ? 0 : index
        desCardBuilder(cities.slice(index + 1, index + 4))
    }
    /**
     * Creates the destinations buttons 
     */
    function desLinkBuilder(data, place) {
        data.forEach((item, index) => {
            let container = $("<div/>").addClass(`flex items-center space-x-2 space-y-1 p-2 ${index + 1 === data.length ? "hover:rounded-b-xl" : "hover:rounded-none"}`),
                img = $("<img/>").attr("src", item.cityBannerImg).addClass("rounded size-10 "),
                btn = $("<h5/>").text(item.cityName).addClass("inline hover:cursor-pointer capitalize link-btn ").attr("routes", "des-" + item.cityName);
            container.append(img, btn);
            $(place).append(container);
        })
    }
    /**
     * This builds the destination cards for the other cities
     * @param {Array} dataArr 
     */
    function desCardBuilder(dataArr) {
        dataArr.forEach((item) => {
            let container = $("<div/>")
                .attr("routes", "des-" + item.cityName).on("click", (e) => switchPageClickEffect(e.target.getAttribute("routes")))
                .addClass("flex flex-col items-center space-y-4 rounded hover:cursor-pointer shadow-sm bg-secondary/50 xl:px-2 xl:py-5 xl:p-10 ease-in-out delay-100 hover:scale-90 transition-all"),
                seal = $("<img/>").attr("src", item.cityBannerImg).addClass("size-20").attr("routes", "des-" + item.cityName),
                cityName = $("<h3/>").text(item.cityName).addClass("capitalize text-white text-2xl").attr("routes", "des-" + item.cityName);
            container.append(seal, cityName)
            $(".des-other").append(container);
        })
    }
    /**
     * This fetches cities.json and performace a optional
     * callback inside of the fetch
     * @param {Function} callback 
     */
    function setUpCities(callback) {
        $.getJSON("data/cities.json", (data) => {
            cities = data.data;
            desLinkBuilder(cities, ".des-cont");
            if (callback) {
                callback();
            }
        });
    }
    /**
     * This handles click effect for switching pages, also hides the
     * destinations container and scrolls to the top if not at top
     * @param {Text} ele 
     */
    function switchPageClickEffect(ele) {
        let route = String(ele);
        if (!localStorage.getItem("lastPage").includes(route)) {
            switchPage(route);
        }
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        $(".des-cont").slideUp("linear");
    }
    /**
     * This will excute when the document is fulley loaded
     */
    $(document).ready(() => {
        // By default the Home page will be loaded first 
        if (localStorage.getItem("lastPage") === null) {
            localStorage.setItem("lastPage", "home");
            switchPage("home");
        } else {
            setUpCities(() => {
                isPopState = true;
                switchPage(localStorage.getItem("lastPage"));
                $(".link-btn").click((e) => switchPageClickEffect(e.target.getAttribute("routes")));
            })
        }
        $(".des-cont").hide();
        $("#des-btn").click(() => {
            $(".des-cont").slideToggle("linear");
        })
    })
    $(window).on("popstate", function (event) {
        let params = new URLSearchParams(window.location.search);
        let cityName = params.get("city");
        let path = window.location.pathname;
        let page = path.split("/").pop().replace(".html", "");
        isPopState = false;
        if (page === "destinations" && cityName) {
            switchPage("des-" + cityName);
        } else {
            switchPage(page);
        }
    });
})();