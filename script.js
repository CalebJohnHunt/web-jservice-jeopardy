async function loadQuestions(e) {
    e.preventDefault();

    var questions;
    var displayAll = false;
    let s = document.getElementById('categorySelect');
    let c = s.options[s.selectedIndex].value;
    if (c) {
        questions = await getCategoryQs({category: {id: c}});
        displayAll = true;
    }
    else {
        var data = await getRandomQ();
        questions = await getCategoryQs(data);
    }
    console.log(questions);
    displayQuestions(questions, displayAll);
}

async function getRandomQ() {
    const url = "https://jservice.io/api/random";
    const response = await fetch(url);
    const data = await response.json();
    return data[0];
}

async function getCategoryQs(q) {
    var url = "https://jservice.io/api/clues?category=" + q.category.id;
    const response = await fetch(url);
    const data = response.json();
    return data;
}

function displayQuestions(questions, displayAll) {
    var output_div = document.getElementById('output');

    var output = '';

    output += "<h1 class='category'>" + questions[0].category.title + "</h1>";

    // Only give air date for random categories, not selected ones
    if (!displayAll) {
        let date = {
            year: questions[0].airdate.slice(0,4),
            month: questions[0].airdate.slice(5, 7),
            day: questions[0].airdate.slice(8,10)
        }
        output += "<div class='category-date'>Aired on " + date.month + '-' + date.day + '-' + date.year + "</div>";
    }

    output += "<div class='clue-table-header row'>";
        output += "<div class='center-container clue-col col-lg-2'><div class='worth-header'><span>Value</span></div></div>";
        output += "<div class='center-container clue-col col-lg-8'><div class='clue-header'><span>Clue</span></div></div>";
        output += "<div class='center-container clue-col col-lg-2'><div class='worth-header'><span>Answer</span></div></div>";
    output += "</div>"; // .clue-header row

    for (let i = 0; i < (displayAll? questions.length : 5); i++) {
        output += "<div class='clue-row row'>";

            // clue_div
            let val = questions[i].value;
            if (!val) {
                let temp = 0;
                if (questions[i-1]) {
                    temp = questions[i-1].value + 200;
                }
                val = "<span class='guesstimate' title='Actually value unknown. This is an estimate.'>" + temp + "</span>"
            }
            output += "<div class='center-container clue-col col-lg-2'><div class='worth center-container'><span>$" + val + "</span></div></div>";
            
            val = questions[i].question
            if (!val) {
                val = "<span class='guesstimate'>No question provided. We apologize for this issue. It has been reported.</span>";
                // Tried to report it. I think it has to be a POST request, so I'm not sure if I can do that via fetch? Oh well
                /*
                fetch('https://jservice.io/api/invalid?id=' + questions[i].id)
                    .then(reponse => {
                        console.log(reponse.json());
                    })
                */
            }
            output += "<div class='center-container clue-col col-lg-8'><div class='clue center-container'><span>" + val + "</span></div></div>";
            output += "<div class='center-container clue-col col-lg-2'><div class='answer center-container' id='" + questions[i].answer + "'><span>" + "Click to reveal answer" + "</span></div></div>";
            
        output += "</div>" // .clue-section
    }

    output_div.innerHTML = output;
    let ans = document.getElementsByClassName('answer');
    for (let i= 0; i < ans.length; i++) {
        ans[i].addEventListener('click', show);
        // console.log(ans[i]);
    }
}

function show() {
    this.innerHTML = this.id;
}

// Add categories to drop down
async function getCategories() {
    let response = await fetch("https://jservice.io/api/categories?count=10&offset=" + Math.floor(Math.random() * 300));
    let cats = await response.json();
    return cats;
}

async function updateCategories() {
    let select = document.getElementById('categorySelect');
    let cats = await getCategories();
    let output = "<option value=''>Random category</option>";
    for (let i = 0; i < cats.length; i++) {
        output += "<option value='" + cats[i].id + "'>" + cats[i].title + "</option>";
    }
    select.innerHTML = output;
}


document.getElementById('generateQuestions').addEventListener('click', loadQuestions);

updateCategories();
