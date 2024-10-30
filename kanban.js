
const taskLists = document.querySelectorAll('.task-list')
const backlogTasks = document.querySelector('#backlog .task-list')
const doingTasks = document.querySelector('#doing .task-list')
const doneTasks = document.querySelector('#done .task-list')
const discardTasks = document.querySelector('#discard .task-list')


const addTaskBtn = document.querySelector('.header__button--new-task')
const closeModalAddTaskBtn = document.querySelector('.add-task-modal__close')
const addTaskModal = document.querySelector('.add-task-modal')


const newTaskTitle = document.querySelector('#title')
const newTaskDescription = document.querySelector('#description')
const newTaskDate = document.querySelector('#date')

const createTaskBtn = document.querySelector('#create-task')



const filterBtn = document.querySelector('.subheader__info-filter')
const filterBtnClose = document.querySelector('.filter-modal__close')
const filterModal = document.querySelector('.filter-modal')

const currentUser = JSON.parse(localStorage.getItem('currentUser')) || []

if (currentUser.role !== 'admin') {
  addTaskBtn.classList.add('none')
}

addTaskBtn.addEventListener('click', newTask)
closeModalAddTaskBtn.addEventListener('click', closeModalAddTask)

filterBtn.addEventListener('click', openModalFilter)
filterBtnClose.addEventListener('click', closeModalFilter)

// let tasks = [
//   {
//     id: 0,
//     title: 'Fix submit button',
//     description:
//       'The submit button has stopped working since the last release.',
//     state: 'backlog',
//     date: '15.09.2024'
//   },
//   {
//     id: 1,
//     title: "Change text on T and C's",
//     description:
//       'The terms and conditions need updating as per the business meeting.',
//     state: 'done',
//     date: '15.09.2024'
//   },
//   {
//     id: 2,
//     title: 'Change banner picture',
//     description:
//       'Marketing has requested a new banner to be added to the website.',
//     state: 'doing',
//     date: '15.09.2024'
//   },
// ]

// localStorage.setItem('tasks', JSON.stringify(tasks));

const currentTasks = JSON.parse(localStorage.getItem('tasks')) || []

taskLists.forEach((taskList) => {
  taskList.addEventListener('dragover', dragOver)
  taskList.addEventListener('drop', dragDrop)
})

function createTask(taskId, title, description, state, date, executor) {
  const taskCard = `
        <div class="task-container task-container--${state}" draggable="true" data-task-id="${taskId}" data-task-state="${state}" data-task-date="${date}">
          <div class="task-decor"></div>
          <div class="task-header__wrapper">
            <div class="task-header">${title}</div>
            <div class="task-details">
              <img src="./img/task-detail.svg" alt="" />
            </div>
          </div>
          <div class="task-footer">
            <div class="task-date">до ${date}</div>
            <div class="task-comment">
              <img src="./img/task-comment.svg" alt="" />
              1
            </div>
          </div>
        </div> 
      `

  let taskCardDrag
  if (state === 'backlog') {
    backlogTasks.insertAdjacentHTML('afterbegin', taskCard)
    taskCardDrag = document.querySelector('.task-container--backlog')
    taskCardDrag.querySelector('.task-decor').style.backgroundColor = '#FF5959'
  }
  if (state === 'doing') {
    doingTasks.insertAdjacentHTML('afterbegin', taskCard)
    taskCardDrag = document.querySelector('.task-container--doing')
    taskCardDrag.querySelector('.task-decor').style.backgroundColor = '#597EFF'
  }
  if (state === 'done') {
    doneTasks.insertAdjacentHTML('afterbegin', taskCard)
    taskCardDrag = document.querySelector('.task-container--done')
    taskCardDrag.querySelector('.task-decor').style.backgroundColor = '#59FFCD'
  }
  if (state === 'discard') {
    discardTasks.insertAdjacentHTML('afterbegin', taskCard)
    taskCardDrag = document.querySelector('.task-container--discard')
    taskCardDrag.querySelector('.task-decor').style.backgroundColor = '#FF59EE'
  }

  taskCardDrag.addEventListener('dragstart', dragStart)
}

function addColor(column) {
  let color
  switch (column) {
    case 'backlog':
      color = '#FF5959'
      break
    case 'doing':
      color = '#597EFF'
      break
    case 'done':
      color = '#59FFCD'
      break
    case 'discard':
      color = '#FF59EE'
      break
    default:
      color = '#FF5959'
  }
  return color
}

function addTasks() {
  currentTasks.forEach((task) =>
    createTask(
      task.id,
      task.title,
      task.description,
      task.state,
      task.date,
      task.executor
    )
  )
}

addTasks()

let elementBeingDragged

function dragStart() {
  elementBeingDragged = this
}

function dragOver(e) {
  e.preventDefault()
}

function dragDrop() {
  const columnId = this.parentNode.id
  let decor = elementBeingDragged.querySelector('.task-decor')
  decor.style.backgroundColor = addColor(columnId)
  elementBeingDragged.setAttribute('data-task-state', columnId)
  this.append(elementBeingDragged)
  let taskId = elementBeingDragged.getAttribute('data-task-id')

  currentTasks.forEach((task) => {
    if (task.id === +taskId) {
      task.state = columnId
    }
  })

  localStorage.setItem('tasks', JSON.stringify(currentTasks))
}


function populateExecutors() {
  const executorSelect = document.getElementById('executor')
  executorSelect.innerHTML = '' 

  
  const users = JSON.parse(localStorage.getItem('users')) || []

  
  users.forEach((user) => {
    const option = document.createElement('option')
    option.value = user.fullName 
    option.textContent = user.fullName 
    executorSelect.appendChild(option)
  })
}


window.onload = populateExecutors

function addTask(e) {
  const executorSelect = document.getElementById('executor')
  const selectedExecutor = executorSelect.value
  e.preventDefault()
  const filteredTitles = currentTasks.filter((task) => {
    return task.title === newTaskTitle.value
  })

  if (!filteredTitles.length) {
    console.log(selectedExecutor)

    const newId = currentTasks.length
    currentTasks.push({
      id: newId,
      title: newTaskTitle.value,
      description: newTaskDescription.value,
      date: newTaskDate.value,
      state: 'backlog',
      executor: selectedExecutor,
    })
    localStorage.setItem('tasks', JSON.stringify(currentTasks))
    createTask(
      newId,
      newTaskTitle.value,
      newTaskDescription.value,
      (state = 'backlog'),
      newTaskDate.value,
      selectedExecutor
    )
    addTaskModal.classList.remove('open')
    newTaskTitle.value = ''
    newTaskDescription.value = ''
    newTaskDate.value = ''
    location.reload()
  } else {
    showError('Title must be unique!')
  }
}
createTaskBtn.addEventListener('click', addTask)

// Добавление новой задачи

function newTask() {
  addTaskModal.classList.add('open')
}

function closeModalAddTask() {
  addTaskModal.classList.remove('open')
}


function openModalFilter() {
  filterModal.classList.add('open')
}

function closeModalFilter() {
  filterModal.classList.remove('open')
}

// Фильтрация задач

const searchInputFilter = document.getElementById('searchInputFilter')
const checkboxes = document.querySelectorAll('input[type="checkbox"]')
const cards = document.querySelectorAll('.task-container')
const resetBtnFilter = document.querySelector('.subheader__info-filter--reset')

function filterTask() {
  const searchTerm = searchInputFilter.value.toLowerCase()
  const currentDate = new Date()
  const selectedFilters = Array.from(checkboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value)

  cards.forEach((card) => {
    const dueDate = new Date(card.getAttribute('data-task-date'))
    const cardText = card.textContent.toLowerCase()

    
    const matchesSearch = cardText.includes(searchTerm)

    // Проверяем фильтр по дате
    const matchesFilter = selectedFilters.some((filter) => {
      if (filter === 'overdue') {
        return dueDate < currentDate
      } else if (filter === 'dueSoon') {
        const oneDayFromNow = new Date(currentDate)
        oneDayFromNow.setDate(currentDate.getDate() + 1)
        return dueDate >= currentDate && dueDate < oneDayFromNow
      } else if (filter === 'dueWeek') {
        const oneWeekFromNow = new Date(currentDate)
        oneWeekFromNow.setDate(currentDate.getDate() + 7)
        return dueDate >= currentDate && dueDate < oneWeekFromNow
      }
      return false
    })

    // Показываем или скрываем карточку
    if (matchesSearch && (selectedFilters.length === 0 || matchesFilter)) {
      card.style.display = 'flex'
    } else {
      card.style.display = 'none'
    }
  })
}

function resetFilters() {
  searchInputFilter.value = ''
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false
  })
  filterTask() 
}

searchInputFilter.addEventListener('input', filterTask)
checkboxes.forEach((checkbox) => {
  checkbox.addEventListener('change', filterTask)
})

resetBtnFilter.addEventListener('click', resetFilters)



const logoutBtn = document.querySelector('.header__user-logout')
logoutBtn.addEventListener('click', logout)

function logout() {
  localStorage.removeItem('currentUser')
  window.location.href = 'index.html'
}



const modalTask = document.querySelector('.task-modal')
const closeBtnTaskModal = document.querySelector('.task-modal__close')
const taskModalTitle = document.querySelector('.task-modal__title')
const taskModalDescription = document.querySelector('.task-modal__description')
const taskModalDate = document.querySelector('.taskmodal-date-value')
const taskModalExecutor = document.querySelector('.task-modal__executor')
const taskModalExecutorSelect = document.querySelector(
  '.task-modal__input-executor'
)
const taskModalDecor = document.querySelector('.task-modal__decor')
const taskModalBtnDeleteTask = document.querySelector(
  '.task-modal__delete-task-btn'
)

// if (currentUser.role === 'admin') {
//   taskModalExecutor.classList.add('none')
// }

if (currentUser.role !== 'admin') {
  taskModalExecutorSelect.classList.add('none')
}

let currentTaskId = null

function populateExecutorSelect() {
  const users = JSON.parse(localStorage.getItem('users')) || []
  taskModalExecutorSelect.innerHTML = '' 

  users.forEach((user) => {
    const option = document.createElement('option')
    option.value = user.fullName 
    option.textContent = user.fullName 
    taskModalExecutorSelect.appendChild(option)
  })
}

function openModal(task) {
  modalTask.classList.add('open')
  taskModalTitle.textContent = task.title
  taskModalDescription.textContent = task.description || null
  taskModalDate.textContent = task.date
  taskModalExecutor.textContent = task.executor
  currentTaskId = task.id

  
  if (currentUser.role === 'admin') {
    taskModalExecutorSelect.value = task.executor 
    populateExecutorSelect() 
  } else {
    taskModalExecutorSelect.classList.add('none') 
  }

  taskModalDecor.className = 'task-modal__decor' 
  taskModalDecor.classList.add(`task-modal__decor--${task.state}`)
}

function saveChanges() {
  const tasks = JSON.parse(localStorage.getItem('tasks'))
  const taskIndex = tasks.findIndex((task) => task.id === currentTaskId)

  if (taskIndex !== -1) {
    tasks[taskIndex].executor = taskModalExecutorSelect.value
    localStorage.setItem('tasks', JSON.stringify(tasks)) 
    closeTaskModal() 
    location.reload() 
  }
}

const taskContainers = document.querySelectorAll('.task-container')

taskContainers.forEach((container) => {
  container.addEventListener('click', function () {
    const taskId = this.getAttribute('data-task-id')
    const task = JSON.parse(localStorage.getItem('tasks')).find(
      (t) => t.id == taskId
    )
    if (task) {
      openModal(task)
    }
  })
})

function deleteTask() {
  const tasks = JSON.parse(localStorage.getItem('tasks'))
  const updatedTasks = tasks.filter((task) => task.id !== currentTaskId) 
  localStorage.setItem('tasks', JSON.stringify(updatedTasks)) 
  closeTaskModal() 
  location.reload() 
}

function closeTaskModal() {
  modalTask.classList.remove('open')
}

taskModalBtnDeleteTask.addEventListener('click', deleteTask)
taskModalExecutorSelect.addEventListener('change', saveChanges)
closeBtnTaskModal.addEventListener('click', closeTaskModal)
