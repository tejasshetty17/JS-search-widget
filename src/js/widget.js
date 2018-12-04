/*

The search widget snippet to be placed in your web page and passing the id of the element
where you want the search box to appear

params: rootId - ID of the element as a string

*/
(function (rootId) {
    parentObject = document.getElementById(rootId);
    parentObject.style.position = 'relative';
    searchInputBox = document.createElement('INPUT');
    searchInputBox.setAttribute("id", "search-field");
    searchInputBox.setAttribute("spellcheck", "false");
    searchInputBox.setAttribute("class", "searchbox");
    searchInputBox.setAttribute("placeholder", "Search here!");
    searchInputBox.setAttribute("autocomplete", "off");
    searchInputBox.setAttribute("autofocus", "on");
    searchInputBox.setAttribute("type", "text");
    searchInputBox.setAttribute("value", "");
    parentObject.appendChild(searchInputBox);
    suggestionBox = document.createElement('DIV');
    suggestionBox.setAttribute("id", "suggestion-wrapper");
    suggestionBox.setAttribute("class", "hide");
    parentObject.appendChild(suggestionBox);
})('searchroot');
// =============================== END of the snippet ============================

// external script for the search widget wrapped inside a setTimeout to mock the downloading of the external script.
setTimeout(() => {
    (function (wytiwyg) {
        // ================================= Mock Server Start =============================
        var FAILURE_COEFF = 10;
        var MAX_SERVER_LATENCY = 200;
        var searchField = document.getElementById('search-field');
        var suggestionListWrapper = document.getElementById('suggestion-wrapper');
        var staleValue = "";
        var liSelected;
        var index = -1;

        function getRandomBool(n) {
            var maxRandomCoeff = 1000;
            if (n > maxRandomCoeff) n = maxRandomCoeff;
            return Math.floor(Math.random() * maxRandomCoeff) % n === 0;
        }

        function getSuggestions(text) {
            var pre = 'pre';
            var post = 'post';
            var results = [];
            if (getRandomBool(2)) {
                results.push(pre + text);
            }
            if (getRandomBool(2)) {
                results.push(text);
            }
            if (getRandomBool(2)) {
                results.push(text + post);
            }
            if (getRandomBool(2)) {
                results.push(pre + text + post);
            }
            return new Promise((resolve, reject) => {
                var randomTimeout = Math.random() * MAX_SERVER_LATENCY;
                setTimeout(() => {
                    if (getRandomBool(FAILURE_COEFF)) {
                        reject();
                    } else {
                        resolve(results);
                    }
                }, randomTimeout);
            });
        }
        // ================================= Mock Server End =============================



        // ================================= Utils =======================================

        /*
            A utillity function for switching the display property of an element
             case 1: Change display state irrespective of the current state.
             case 2: Change state to block when it's none and if it's already in block do nothing.
             case 3: Change state to none when it's block and if it's already in none do nothing.
    
             params : element - the element object of the the state has to be changed.
                      display - a string with values toggle show and hide.
    
         */
        var toggleDisplay = (element, display) => {
            var elementClasses = element.classList;
            switch (display) {
                case 'toggle':
                    if (elementClasses.contains('hide')) {
                        elementClasses.remove('hide');
                    } else {
                        elementClasses.add('hide');
                    }
                    break;
                case 'show':
                    if (elementClasses.contains('hide')) {
                        elementClasses.remove('hide');
                    }
                    break;
                case 'hide':
                    if (!(elementClasses.contains('hide'))) {
                        elementClasses.add('hide');
                    }
                    break;
                default:
            }
        }


        // ================================= Utils End ===================================
        /*
            Function to get the current word that's beign typed
    
            params : searchQuery - string value from the input element
            return : queryObject - An object containig the current word that's beign typed and the rest of the string from the input element
    
        */
        var getSearchQuery = searchQuery => {
            var queryObject = {}
            queryObject.searchWords = searchQuery.split(" ");
            queryObject.currentWord = queryObject.searchWords.pop();
            queryObject.searchWords ? queryObject.searchWords = queryObject.searchWords.join(" ") : queryObject.searchWords = "";
            return queryObject;
        }

        /*
        Function to get the entire suggestion dropdown in a stirng.
    
        params : suggestionList - Array of strings from the backend api
                 queryObject - An object containig the current word that's beign typed and the rest of the string from the input element
        return : The suggestion dropdown markup in a string.
        */

        var createSuggestionList = (suggestionList, queryObject) => {
            var searchSuggestionList = ""
            if (suggestionList.length === 0) {
                searchSuggestionList = '<ul class="suggestion-list-wrapper"><li class="suggestion">This is something new!!!</li></ul>';
                return searchSuggestionList;
            }
            searchSuggestionList = '<ul class="suggestion-list-wrapper">'
            for (var i = 0; i < suggestionList.length; i++) {

                listText = queryObject.searchWords + ' ' + suggestionList[i].replace(queryObject.currentWord,
                    '<strong>' + queryObject.currentWord + '</strong>');
                searchSuggestionList += '<li class="suggestion" tabindex="0">' + listText + '</li>';
            }
            searchSuggestionList += '</ul>';
            return searchSuggestionList;
        }

        /*
        Function to handle the keyup event on the search bar
            1. sanitizes the string
            2. gets the queryObject.
            3. passes it on to createsuggestonList and gets a dropdown markup in string
            4. appends to the DOM.
        */

        var searchBarKeyUpHandler = event => {
            var searchQuery = searchField.value.replace(/  +/g, ' ').trim();
            var staleFlag = true;
            if (event.which === 40 || event.which === 38 || event.which === 13 || searchQuery === staleValue || searchQuery === staleValue + " ") {
                return;
            } else if (searchQuery === "") {
                suggestionListWrapper.innerHTML = "";
                return;
            }
            staleValue = searchQuery;
            staleFlag = false;

            var queryObject = getSearchQuery(searchQuery);
            if ((!queryObject.currentWord) && (staleFlag)) {
                return;
            }

            var suggestionResult = getSuggestions(queryObject.currentWord);
            suggestionResult.then(function (result) {
                suggestionHtml = createSuggestionList(result, queryObject);
                toggleDisplay(suggestionListWrapper, 'show');
                suggestionListWrapper.innerHTML = suggestionHtml;
            },
                function (error) {
                    console.log(error, 'inside then error');
                    var errorList = '<ul class="suggestion-list-wrapper"><li class="suggestion">This is something new!!!</li></ul>';
                    suggestionListWrapper.innerHTML = errorList;
                }
            );
        }

        /*
        Function to handle clicks on the window and toggle display of the dropdown
        based on the point where the click occured.
    
        */

        var windowClickHandler = event => {
            var target = event.target;
            if (liSelected) {
                liSelected.classList.remove('selected');
                liSelected = null;
            }
            if (target.classList.contains('searchbox')) {
                toggleDisplay(suggestionListWrapper, 'show');
            } else if (target.classList.contains('suggestion')) {
                searchField.value = target.textContent + " ";
                toggleDisplay(suggestionListWrapper, 'hide');

            } else {
                toggleDisplay(suggestionListWrapper, 'hide');
            }
        }

        /*
        Function to handle keydown event to navigate around the dropdown
        and select a list item with the arrow and Enter Keys.
        */

        var navigationKeyDownHandler = event => {
            if (suggestionListWrapper.classList.contains('hide')) {
                return;
            }

            var len = suggestionListWrapper.getElementsByTagName('li').length - 1;
            switch (event.which) {
                case 40:
                    index++;
                    //down
                    if (liSelected) {
                        liSelected.classList.remove('selected');
                        next = suggestionListWrapper.getElementsByTagName('li')[index];
                        if (typeof next !== undefined && index <= len) {

                            liSelected = next;
                        } else {
                            index = 0;
                            liSelected = suggestionListWrapper.getElementsByTagName('li')[0];
                        }
                        liSelected.classList.add('selected');
                        searchField.value = liSelected.textContent + " ";
                    } else {
                        index = 0;

                        liSelected = suggestionListWrapper.getElementsByTagName('li')[0];
                        liSelected.classList.add('selected');
                        searchField.value = liSelected.textContent + " ";
                    }
                    break;
                case 38:
                    event.preventDefault();
                    if (liSelected) {
                        liSelected.classList.remove('selected');
                        index--;
                        next = suggestionListWrapper.getElementsByTagName('li')[index];
                        if (typeof next !== undefined && index >= 0) {
                            liSelected = next;
                        } else {
                            index = len;
                            liSelected = suggestionListWrapper.getElementsByTagName('li')[len];
                        }
                        liSelected.classList.add('selected');
                        searchField.value = liSelected.textContent + " ";
                    } else {
                        index = 0;
                        liSelected = suggestionListWrapper.getElementsByTagName('li')[len];
                        liSelected.classList.add('selected');
                        searchField.value = liSelected.textContent + " ";
                    }
                    break;
                case 13:
                    if (liSelected) {
                        searchField.value = liSelected.textContent + " ";
                        toggleDisplay(suggestionListWrapper, 'hide');
                        searchField.blur();
                        liSelected.classList.remove('selected');
                        liSelected = null;
                    } else {
                        toggleDisplay(suggestionListWrapper, 'hide');
                        searchField.blur();
                    }
                    break;
                default:
            }
        }

        searchField.addEventListener('keyup', function (event) {
            searchBarKeyUpHandler(event);
        }, false);

        window.addEventListener('mousedown', function (event) {
            windowClickHandler(event);
        }, false);

        window.addEventListener('focusout', function (event) {
            toggleDisplay(suggestionListWrapper, 'hide');
        }, false);

        document.addEventListener('keydown', function (event) {
            navigationKeyDownHandler(event);
        }, false);
    })(window.wytiwyg = {});
}, 100);
