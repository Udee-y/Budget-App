var budgetController = (function () {
  var Expenses = function (id, description, value) {
    (this.id = id), (this.description = description), (this.value = value), (this.percentage = -1);
  };

  //you need total income to calc percentages
  Expenses.prototype.calcPercentage = function(totalIncome){
     if(totalIncome > 0) {
     this.percentage = Math.round((this.value / totalIncome ) * 100);
     }else {
      this.percentage = -1;
     }
  };

  Expenses.prototype.getPercentage = function(){
    return this.percentage;
  };

  var Incomes = function (id, description, value) {
    (this.id = id), (this.description = description), (this.value = value);
  };
  var CalculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach(element => {
      sum = sum + element.value;
    });

data.totals [type] = sum;

  };
  var data = {
    allItems: {
      exp: [],
      inc: [],
    },

    totals: {
      exp: 0,
      inc: 0,
    },
    budget : 0,
    percentage: -1
  };

 
  return {
    addItems: function (type, des, val) {
      var newItem, ID;

      //Create a new ID
      // ID = lastID + 1
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      //Create a new item based on 'inc' or 'exp' type
      if (type === "exp") {
        newItem = new Expenses(ID, des, val);
      } else if (type === "inc") {
        newItem = new Incomes(ID, des, val);
      }

      //Push it into our data structure
      data.allItems[type].push(newItem);

      // Return the new element
      return newItem;
    },
//[1, 2, 4, 5, 6]
    deleteItems : function(type, id){
        var ids, index;
        ids = data.allItems[type].map(function(current){
          return current.id;
        });

        index = ids.indexOf(id);

        if(index !== -1) {
          data.allItems[type].splice(index, 1);
        }
    },

    calculateBudget: function(){

      // Calculate  total income and expenses (write a seperate function for that: object constructor)
      CalculateTotal('exp');
      CalculateTotal('inc');

      // Calculate budget : income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // Calculate the percentage of income spent
      if(data.totals.inc > 0){
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100 );
      } else{
        data.percentage = -1;
      }
      
    },

    calculatePercentages : function(){
      /*  assuming we have 3 exp : a b c
      a = 20, b = 10, c = 40  & income = 100
      expense percentages = for a = 20/100 = 20%
      b = 10/100 = 10%
      */
     data.allItems.exp.forEach(function(cur){
        cur.calcPercentage(data.totals.inc);
     });
    },

    getPercentages: function(){
      var allPerc = data.allItems.exp.map(function(cur){
        return cur.getPercentage();
      });
      return allPerc;
      },
      

    getBudget : function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp : data.totals.exp,
        percentage: data.percentage
      }
    },

    testing: function () {
      console.log(data);
    },
  };
})();

//UI CONTROLLER

var UIController = (function () {
  var DOMstrings = {
    inputType: ".select-type",
    inputDescription: ".add-description",
    inputValue: ".add-value",
    inputButton: ".add-button",
    incomeContainer : ".income-end-list",
    expensesContainer : ".expenses-end-list",
    budgetLabel : ".header-value",
    incomeLabel : ".income-value",
    expenseLabel: ".expense-value",
    percentageLabel: ".percentage-value",
    container: ".container",
    expensesPercentage : ".item-percentage",
    dateLabel : ".header-month"
  };

  var formatNumber = function (num , type) {
    var numberSplit, integer, decimal, type;
  
    num = Math.abs(num);    //returns the absolute number

    // write the number in 2 decimal places
    num = num.toFixed(2);  //returns a string

    // divide the number into decimal part and interger part
    numberSplit = num.split('.');

      integer = numberSplit[0];
      // add a comma to seperate the thousands
        if (integer.length > 3) {
          integer = integer.substr(0, integer.length - 3) + ',' + integer.substr(integer.length - 3 , 3); 
          //substr takes 2 arguments: the start point and the number of characters you want
        }

    decimal = numberSplit[1];

    // add + or - in front of the number
         //type === 'exp' ? sign = '-' : sign = '+'
    return (type === 'exp' ? '-' : '+') + ' ' + integer + '.' + decimal;
        
 };

  var nodeListForEach = function(list, callBackFnf){
      for(var i = 0; i < list.length ; i++){
      callBackFnf(list[i], i); //index = i
      }
  };

  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value, //Will be either inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat (document.querySelector(DOMstrings.inputValue).value)
      };
    },

    addListItem: function (obj, type) {
      var html, newHtml, element
      // create html string with placeholder text
      
      if (type === "inc") {
        element = DOMstrings.incomeContainer;
        html =
          '<div class="items" id="inc-%id%"><p class="item-description">%description%</p><div class="right"><div class="item-value">%value%</div><div class="btn-delete color2"><button class="item-delete">x</button></div></div></div>';
      } else if (type === "exp") {
        element = DOMstrings.expensesContainer;
        html =
          '<div class="items" id="exp-%id%"><p class="item-description">%description%</p><div class="right"><div class="item-value">%value%</div><div class="item-percentage">10%</div><div class="btn-delete color1"><button class="item-delete col">x</button></div></div></div>';
      }

      // replace placeholder text with actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%' , obj.description);
      newHtml = newHtml.replace('%value%' , formatNumber(obj.value, type));
      
      //insert html into the dom
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml); 
    },

    deleteListItem : function(selectorID){

     var el = document.getElementById(selectorID);
     el.parentNode.removeChild(el);
      
    },

    clearFields : function(){
      var fields, fieldsArray
     
      // document.queryselectorall returns an array containing all the selected elements
      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
       
      //array.prototype allows the fields to have properties of an array
       fieldsArray = Array.prototype.slice.call(fields);

        //e can also be element
       fieldsArray.forEach(element => {
        element.value = "";
    });

      // the focus goes to the first element of the array which is the description
    fieldsArray[0].focus();
    },

    displayBudget: function(obj){
      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstrings.expenseLabel).textContent =  formatNumber(obj.totalExp, 'exp');
  
      if(obj.percentage > 0){
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      }else{
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
    },

    //display the percentage
      displayPercentage : function(percentages){

        var field = document.querySelectorAll(DOMstrings.expensesPercentage);

      /*var nodeListForEach = function(list, callBackFnf){
        for(var i = 0; i < list.length ; i++){
          callBackFnf(list[i], i); //index = i
        }
      };*/
        // define the call back function

      nodeListForEach(field, function(current, index){
      if(percentages[index]  > 0){
          current.textContent = percentages[index] + '%';
      } else{
        current.textContent = '---';
      }
      });

    },
      // Display the present month and year
    displayMonth : function(){
      var now, year, month, months;

      now = new Date();
      months = ['January' , 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
    },

    changeType : function() {
        var inpFields = document.querySelectorAll(
          DOMstrings.inputType +  ',' +
          DOMstrings.inputDescription + ',' +
          DOMstrings.inputValue 
        );

        nodeListForEach(inpFields, function(e) {
          e.classList.toggle('input-focus');
        });

      document.querySelector(DOMstrings.inputButton).classList.toggle('input-color');
    },

    getDOMstrings: function () {
      return DOMstrings;
    },
  };
})();

//GLOBAL APP CONTROLLER

var controller = (function (budgetcntrl, UIcntrl) {

  var setUpEventListeners = function () {
    // variable to store classes for input fields
    var DOM = UIcntrl.getDOMstrings();

    //Clicking the button and also inputing values
    document
      .querySelector(DOM.inputButton)
      .addEventListener("click", cntrlAddItems);
    document.addEventListener("keypress", function (e) {
      if (e.keyCode === 13 || e.which === 13) {
        cntrlAddItems();
      }
    });

    //Another event listener for the delete button
     document.querySelector(DOM.container).addEventListener('click', cntrlDeleteItems);

     // Another event listener for changing focus color when the select type changes
     document.querySelector(DOM.inputType).addEventListener('change', UIcntrl.changeType);

  };

  var updateBudget = function(){
    // 1. calculate the budget
        budgetcntrl.calculateBudget();

    // 2. Return the budget
        var budget = budgetcntrl.getBudget();

    // 3. display the budget on the UI
    UIcntrl.displayBudget(budget);
  };

  var updatePercentage = function(){

   // calculate the percentage
      budgetcntrl.calculatePercentages();

   // read percentage from budget controller
      var percent = budgetcntrl.getPercentages();

   // update the UI
      UIcntrl.displayPercentage(percent); 

  };

  var cntrlAddItems = function () {
    var input, newItem;
    // 1. get the field input data
    input = UIcntrl.getInput();

    // get value only when there is a description
    if (input.description !== "" && !isNaN(input.value) && input.value > 0){

    // 2. add the item to the budget controller
    newItem = budgetcntrl.addItems(input.type, input.description, input.value);
    // 3. add the item to the UI
    UIcntrl.addListItem(newItem, input.type);

    //4. clear the fields
    UIcntrl.clearFields();
    
    //5. Calculate and update the budget
    updateBudget();

    //6. calculate and update percentage whwn you put an expense
          updatePercentage();

    }
  };

  // e is event

  var cntrlDeleteItems = function(e){
    var itemID, splitID;

      itemID = e.target.parentNode.parentNode.parentNode.id;
     //if itemid is not undefined i.e if you dont click somewhere else on the page
      if(itemID){
        //inc-1 0r exp-1 on split gives ['inc', '1'] or ['exp' '1']
          splitID = itemID.split('-');
          type = splitID[0];
          ID = parseInt(splitID[1]);
      
      // delete an item from the data structure
      budgetcntrl.deleteItems(type, ID);

      // update the ui i.e delete the item from the UI
      UIcntrl.deleteListItem(itemID);

      // show and update the new budget
      updateBudget();
      
      //calculate and update percrntage
        updatePercentage();

        }
  
    };

  return {
    init: function () {
      UIcntrl.displayMonth();
      console.log("application has started");
      UIcntrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp : 0,
        percentage: -1
      });
      setUpEventListeners();
    },
  };
})(budgetController, UIController);

controller.init();
