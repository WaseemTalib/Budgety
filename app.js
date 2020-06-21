// for budget control
var budgetController = (() => {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1
    }
    Expense.prototype.calcPercentages = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100)
        } else {
            this.percentage = -1
        }
    }

    Expense.prototype.getPercentage = function () {
        return this.percentage
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var calculateTotal = (type) => {
        var sum = 0;
        data.allItems[type].forEach(el => {
            sum += el.value
        });
        data.totals[type] = sum;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function (type, description, value) {
            var newItem, ID;

            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0
            }
            if (type === 'exp') {
                newItem = new Expense(ID, description, value)
            } else if (type === 'inc') {
                newItem = new Income(ID, description, value)
            }
            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function (type, id) {
            var ids, index;

            ids = data.allItems[type].map(function (current) {
                return current.id
            })
            index = ids.indexOf(id)
            if (index !== -1) {
                data.allItems[type].splice(index, 1)
            }
        },

        calculateBudget: function () {

            // calculateTotals of income and expense
            calculateTotal('inc');
            calculateTotal('exp');

            // calculate budget income - expense
            data.budget = data.totals.inc - data.totals.exp

            // percentage of income we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
            } else {
                data.percentage = -1
            }
        },

        calculatePercentages: () => {
            data.allItems.exp.forEach(function (curr) {
                curr.calcPercentages(data.totals.inc)
            })
        },
        getPercentage: () => {
            var allPerc = data.allItems.exp.map(function (curr) {
                return curr.getPercentage()
            })
            return allPerc
        },

        getBudget: function () {
            return {
                budget: data.budget,
                percentage: data.percentage,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp
            }
        },

        testing: () => {
            console.log(data)
        },
    }

})();

// for UI control 
var UIController = (() => {
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePercentageLabel: '.item__percentage',
        month: '.budget__title--month',
    };

    formatNumber = (num, type) => {
        var numSplit, int, dec, addSign;

        num = Math.abs(num)

        // two decimal parts like 2000.00
        num = num.toFixed(2)

        // adding coma to format nicely + 2,000.00
        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length)
        }
        dec = numSplit[1];
        //  add + and - sign with income and expense respectively like + 2000
        addSign = (type === 'exp' ? '-' : '+')
        return addSign + ' ' + int + '.' + dec
    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i)
        }
    }

    return {
        getInput: () => {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }

        },
        addListItem: function (obj, type) {
            var html, newHtml, element;

            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = `<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div>
                <div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`
            } else if (type === 'exp') {
                element = DOMStrings.expenseContainer;
                html = `<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div>
                <div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div>
                <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)
        },

        deleteItem: function (itemID) {
            var el = document.getElementById(itemID);
            el.parentNode.removeChild(el)
        },

        clearFields: function () {
            document.querySelector(DOMStrings.inputDescription).value = "";
            document.querySelector(DOMStrings.inputValue).value = "";
            document.querySelector(DOMStrings.inputDescription).focus();
        },

        displayBudget: (obj) => {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp' 
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '-';
            }
        },

        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMStrings.expensePercentageLabel);

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%'
                } else {
                    current.textContent = '-'
                }
            })
        },

        displayMonth: () => {
            var now, year, month, date;
            var now = new Date()

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'Novermber', 'December']

            date = now.getDate();
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMStrings.month).textContent = date + ' ' + months[month] + ' ' + year

        },

        changeType: function () {
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +     
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue
            )
            nodeListForEach(fields, function (cur) {
              var fields =  cur.classList.toggle('red-focus')
           console.log(fields)
            })
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red')
        },

        getDOMStrings: () => {
            return DOMStrings;
        }
    }

})();


// for Global application
var controller = ((budgetCtrl, UICtrl) => {

    var eventListeners = () => {
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', addItem);
        document.addEventListener('keypress', (ev) => {
            if (ev.key === "Enter" && ev.keyCode === 13) {
                addItem()
            }
        })
        document.querySelector(DOM.container), addEventListener('click', deleteItem);
        document.querySelector(DOM.inputType), addEventListener('change', UICtrl.changeType);
        
    }

    var updatePercentages = () => {
        // calculate percentages
        budgetCtrl.calculatePercentages();

        // Read percentages from budget controller
        var percentages = budgetCtrl.getPercentage();

        // update UI with percentages
        UICtrl.displayPercentages(percentages)
    }
    updateBudget = function () {

        // calculate budget
        budgetCtrl.calculateBudget()

        // return budget
        var budget = budgetCtrl.getBudget()

        // display in UI
        UICtrl.displayBudget(budget)

    };

    var deleteItem = function (ev) {
        var itemID, splitID, type, ID;

        itemID = ev.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1])

            // 1. delete item from data structure
            budgetCtrl.deleteItem(type, ID)

            // 2. delete item from UI
            UICtrl.deleteItem(itemID)
            // 3. update and show the new budget
            updateBudget();

            // 4. calculate and update percentages
            updatePercentages();
        }

    }


    addItem = () => {
        var input, newItem, addListItem;

        // 1. get data from fields
        input = UICtrl.getInput()

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // 2. add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value)

            // 3. Add item to UI
            addListItem = UICtrl.addListItem(newItem, input.type)
            // 4. clear fields
            UICtrl.clearFields()

            // 5. Calculate & update budget
            updateBudget();

            // 6. calculate and update percentages
            updatePercentages();
        }
    }

    return {
        init: () => {
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                percentage: -1,
                totalInc: 0,
                totalExp: 0
            })

            eventListeners()
        }
    }

})(budgetController, UIController);

controller.init();
