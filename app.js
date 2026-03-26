const form          = document.getElementById('expense-form')
const expenseBody   = document.getElementById('expense-body')
const budgetMeter   = document.getElementById('budget-meter')
const meterLabel    = document.getElementById('meter-label')
const totalSpentEl  = document.getElementById('total-spent')
const remainingEl   = document.getElementById('remaining')
const entryCountEl  = document.getElementById('entry-count')
const entrySummaryEl = document.getElementById('entry-summary')
const saveToast     = document.getElementById('save-toast')

// Budget cap
const BUDGET = 5000

let expenses = JSON.parse(localStorage.getItem('expenses')) || []

// Core render function
function renderTable() {

    // 1. clear table with while loop
    while (expenseBody.firstChild) {
        expenseBody.removeChild(expenseBody.firstChild)
    }

    // 2. loop through expenses and build rows
    let totalSpent = 0

    for (let i = 0; i < expenses.length; i++) {
        const expense = expenses[i]

        // create row
        const tr = document.createElement('tr')

        // name cell
        const nameTd = document.createElement('td')
        nameTd.textContent = expense.name

        // category cell
        const catTd = document.createElement('td')
        const catSpan = document.createElement('span')
        catSpan.textContent = expense.category

        // apply category color class using switch
        switch (expense.category) {
            case 'food':          catSpan.className = 'cat-food';
            break
            case 'transport':     catSpan.className = 'cat-transport';
            break
            case 'entertainment': catSpan.className = 'cat-entertainment';
            break
            default:              catSpan.className = 'cat-other'
        }

        catTd.append(catSpan)

        // amount cell
        const amountTd = document.createElement('td')
        amountTd.textContent = '₱' + Number(expense.amount).toFixed(2)

        // delete button cell
        const actionTd = document.createElement('td')
        const deleteBtn = document.createElement('button')
        deleteBtn.textContent = 'Delete'
        deleteBtn.className = 'delete-btn'
        deleteBtn.dataset.index = i
        actionTd.append(deleteBtn)

        // append all cells to row
        tr.append(nameTd, catTd, amountTd, actionTd)

        // prepend row to top of table
        expenseBody.prepend(tr)

        // add to total
        totalSpent += Number(expense.amount)
    }

    // 3. calculate remaining
    const remaining = BUDGET - totalSpent

    // 4. update all display elements
    budgetMeter.value          = totalSpent
    meterLabel.textContent     = '₱' + totalSpent + ' / ₱' + BUDGET
    totalSpentEl.textContent   = 'Spent: ₱' + totalSpent.toFixed(2)
    remainingEl.textContent    = 'Remaining: ₱' + remaining.toFixed(2)
    entryCountEl.textContent   = expenses.length + ' entries'
    entrySummaryEl.textContent = 'Entries: ' + expenses.length
}

function saveToLocalStorage() {
    // save expenses array to localStorage
    localStorage.setItem('expenses', JSON.stringify(expenses))

    // show the toast
    saveToast.classList.remove('hidden')

    // hide the toast after 1.5 seconds
    setTimeout(function() {
        saveToast.classList.add('hidden')
    }, 1500)
}

form.addEventListener('submit', function(event) {

    // 1. stop page reload
    event.preventDefault()

    // 2. read input values
    const name     = document.getElementById('expense-name').value.trim()
    const amount   = document.getElementById('expense-amount').value
    const category = document.getElementById('expense-category').value

    // 3. validate
    if (name === '' || parseFloat(amount) <= 0) {
        return
    }

    // 4. create expense object
    const newExpense = {
        name:     name,
        amount:   parseFloat(amount),
        category: category
    }

    // 5. add to array
    expenses.push(newExpense)

    // 6. save to localStorage
    saveToLocalStorage()

    // 7. re-render table
    renderTable()

    // 8. clear form
    form.reset()

})

expenseBody.addEventListener('click', function(event) {
    if (event.target.classList.contains('delete-btn')) {
        const index = Number(event.target.dataset.index)
        expenses.splice(index, 1)
        saveToLocalStorage()
        renderTable()
    }
})

const filterBtns = document.getElementsByClassName('filter-btn')

for (let i = 0; i < filterBtns.length; i++) {

    filterBtns[i].addEventListener('click', function(event) {

        // 1. remove active from ALL buttons
        for (let j = 0; j < filterBtns.length; j++) {
            filterBtns[j].classList.remove('active')
        }

        // 2. add active to clicked button
        event.target.classList.add('active')

        // 3. read which filter was clicked
        const activeFilter = event.target.dataset.filter

        // 4. grab all rows
        const rows = document.querySelectorAll('#expense-body tr')

        // 5. loop over rows and show/hide
        for (let k = 0; k < rows.length; k++) {
            const row = rows[k]

            // find the delete button in this row to get the index
            const deleteBtn = row.querySelector('.delete-btn')
            const index = Number(deleteBtn.dataset.index)
            const expense = expenses[index]

            if (activeFilter === 'all') {
                // show everything
                row.classList.remove('filtered-out')
            } else if (expense.category === activeFilter) {
                // matches filter — show
                row.classList.remove('filtered-out')
            } else {
                // doesn't match — hide
                row.classList.add('filtered-out')
            }
        }

    })
}

renderTable()