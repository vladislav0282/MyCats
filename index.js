
const $wr = document.querySelector('[data-wr]')

const $modalWr = document.querySelector('[data-modalWr]')
const $modalContent = document.querySelector('[data-modalContent]')
const $catCreateFormTemplate = document.getElementById('createCatForm')
const $catEdit = document.querySelector ('[data-catEdit]')   
const $formEditData = document.querySelector ('[data-formEdit]')

const $catDeteil = document.querySelector ('[data-catDeteil]') 

const $deteilContent = document.querySelector ('[data-deteilContent]') 

const $formDeteil = document.querySelector ('[data-formDeteil]') 



const CREATE_FORM_LS_KEY = 'CREATE_FORM_LS_KEY'

const ACTIONS = {
  DETAIL: 'detail',
  DELETE: 'delete',
  EDIT: 'edit',
}

const getCatHTML = (cat) => `
		<div data-cat-id="${cat.id}" class="card mb-4 mx-2" style="width: 18rem">
		<img src="${cat.image}" class="card-img-top" alt="${cat.name}" />
		<div class="card-body">
			<h5 class="card-title">${cat.name}</h5>
			<p class="card-text">
				${cat.description}
			</p>
			<button data-action="${ACTIONS.DETAIL}" type="button" class="btn btn-primary">Detail</button>
			<button data-action="${ACTIONS.DELETE}" type="button" class="btn btn-danger">Delete</button>
      <button data-action="${ACTIONS.EDIT}" type="button" class="btn btn-success">Edit</button>
		</div>
	</div>
	`

  const getCatDeteilHTML = (cat) => `
		<div data-cat-id="${cat.id}" class="card mb-4 mx-2" style="width: 18rem">
		<img src="${cat.image}" class="card-img-top" alt="${cat.name}" />
		<div class="card-body">
			<h5 class="card-title">Name: ${cat.name}</h5>
      <p class="card-text">
				Id: ${cat.id}
			</p>
      <p class="card-text">
				Age: ${cat.age}
			</p>
      <p class="card-text">
				Rate: ${cat.rate}
			</p>
			<p class="card-text">
      Description: ${cat.description}
			</p>
      <p class="card-text">
      Favorite: ${cat.favorite}
			</p>
		</div>
	</div>
	`


fetch('https://cats.petiteweb.dev/api/single/vladislav0282/show/')
  .then((res) => res.json())
  .then((data) => {
    $wr.insertAdjacentHTML(
      'afterbegin',
      data.map((cat) => getCatHTML(cat)).join(''),
    )
  })

$wr.addEventListener('click', (e) => {
  if (e.target.dataset.action === ACTIONS.DELETE) {
    const $catWr = e.target.closest('[data-cat-id]')
    const catId = $catWr.dataset.catId

    fetch(`https://cats.petiteweb.dev/api/single/vladislav0282/delete/${catId}`, {
      method: 'DELETE',
    }).then((res) => {
      if (res.status === 200) {
        return $catWr.remove()
      }

      alert(`Удаление кота с id = ${catId} не удалось`)
    })
  }
})

const formatCreateFormData = (formDataObject) => ({
  ...formDataObject,
  id: +formDataObject.id,
  rate: +formDataObject.rate,
  age: +formDataObject.age,
  favorite: !!formDataObject.favorite,
})

const clickModalWrHandler = (e) => {
  if (e.target === $modalWr) {
    $modalWr.classList.add('hidden')
    $modalWr.removeEventListener('click', clickModalWrHandler)
    $modalContent.innerHTML = ''
  }
}

const openModalHandler = (e) => {
  const targetModalName = e.target.dataset.openmodal

  if (targetModalName === 'createCat') {
    $modalWr.classList.remove('hidden')
    $modalWr.addEventListener('click', clickModalWrHandler)

    /**
     * Чтобы не хранить HTML разметку нашей формы создания котов в js
     * мы используем тег template. Он был разработан,
     * как раз для этих целей. В нем может содержаться разметка, которая
     * нужна не сразу, а когда-то в будущем. Наша форма при загрузке не нужна,
     * она потребуется только когда мы нажнем на кнопку "Add", т.е.
     * когда откроется модалка
     * */

    const cloneCatCreateForm = $catCreateFormTemplate.content.cloneNode(true)
    $modalContent.appendChild(cloneCatCreateForm)

    const $createCatForm = document.forms.createCatForm

    const dataFromLS = localStorage.getItem(CREATE_FORM_LS_KEY)

    const preparedDataFromLS = dataFromLS && JSON.parse(dataFromLS)

    if (preparedDataFromLS) {
      Object.keys(preparedDataFromLS).forEach((key) => {
        $createCatForm[key].value = preparedDataFromLS[key]
      })
    }

    /**
     * Так как мы теперь удаляем содержимое модалки (физически удаляем разметку),
     * то нам не нужно праиться над тем, что при следующем открытии модалки на форме
     * будут накапливаться слушатели событий. Нет, после удаления формы из разметки
     * современные браузеры сами удалять всех слушателей. Поэтому выносить callback
     * обработчика событий в отдельную функцию не нужно
     */
    $createCatForm.addEventListener('submit', (submitEvent) => {
      submitEvent.preventDefault()

      const formDataObject = formatCreateFormData(
        Object.fromEntries(new FormData(submitEvent.target).entries()),
      )

      fetch('https://cats.petiteweb.dev/api/single/vladislav0282/add/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataObject),
      }).then((res) => {
        if (res.status === 200) {
          $modalWr.classList.add('hidden')
          $modalWr.removeEventListener('click', clickModalWrHandler)
          $modalContent.innerHTML = ''

          // После успешного создания кота, удаляем все данные из LS
          // по ключу CREATE_FORM_LS_KEY, чтобы при следующем открытии формы
          // поля были пустые
          localStorage.removeItem(CREATE_FORM_LS_KEY)
          return $wr.insertAdjacentHTML(
            'afterbegin',
            getCatHTML(formDataObject),
          )
        }
        throw Error('Ошибка при создании кота')
      }).catch(alert)
    })
    $createCatForm.addEventListener('change', () => {
      const formattedData = formatCreateFormData(
        Object.fromEntries(new FormData($createCatForm).entries()),
      )

      localStorage.setItem(CREATE_FORM_LS_KEY, JSON.stringify(formattedData))
    })
  }
}

document.addEventListener('click', openModalHandler)

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    $modalWr.classList.add('hidden')
    $modalWr.removeEventListener('click', clickModalWrHandler)
    $modalContent.innerHTML = ''
  }
})


$wr.addEventListener('click', (e) => {
  
    if (e.target.dataset.action === ACTIONS.DETAIL) {
     
    const $catWr = e.target.closest('[data-cat-id]')
    
    const catId = $catWr.dataset.catId

    $catEdit.classList.remove('hidden')
    
   let formEditData = Object.fromEntries(new FormData($formEditData).entries())
  
    formEditData = {
      ...formEditData,
      id: +formEditData.id,
      rate: +formEditData.rate,
      age: +formEditData.age,
      favorite: !!formEditData.favorite,
    }

    fetch(`https://cats.petiteweb.dev/api/single/vladislav0282/show/${catId}`)
  .then((res) => res.json())
  .then((data) => {
    $catEdit.insertAdjacentHTML(
      "afterbegin",
     getCatDeteilHTML(data))
    })
  }
})

  document.addEventListener('click', (e) => {
    if (e.target === $catEdit){
      $catEdit.classList.add('hidden')
      $catEdit.innerHTML = ''
    } else if (e.target === $formEditData){
      console.log('hkhk');

    }
    })
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        $catEdit.classList.add('hidden')
        $catEdit.innerHTML = ''
      }
  })



  $wr.addEventListener('click', (e) => {
  
    if (e.target.dataset.action === ACTIONS.EDIT) {
     
    const $catWr = e.target.closest('[data-cat-id]')

    let catId = $catWr.dataset.catId

    $catDeteil.classList.remove('hidden')
    
  

let formDeteilData = Object.fromEntries(new FormData($formDeteil).entries())
  

// получение пустой формы
    formDeteilData = {
      ...formDeteilData,
      id: +formDeteilData.id,
      rate: +formDeteilData.rate,
      age: +formDeteilData.age,
      favorite: !!formDeteilData.favorite,
    }
   

  fetch(`https://cats.petiteweb.dev/api/single/vladislav0282/show/${catId}`)
  .then((res) => res.json())
  .then((data) => {
    formDeteilData = {
    ...data            // приход объекта c id от БД 
  }
 

  let formDeteilDataValues = Object.values(formDeteilData)
  

  $formDeteil.querySelectorAll('input')[0].value = formDeteilDataValues[0]
  $formDeteil.querySelectorAll('input')[1].value = formDeteilDataValues[1]
  $formDeteil.querySelectorAll('input')[2].value = formDeteilDataValues[4]
  $formDeteil.querySelectorAll('input')[3].value = formDeteilDataValues[5]
  $formDeteil.querySelectorAll('input')[4].value = formDeteilDataValues[6]
  $formDeteil.querySelectorAll('input')[5].value = formDeteilDataValues[3]
  $formDeteil.querySelectorAll('input')[6].value = formDeteilDataValues[2]
  })
}
})
 
  document.addEventListener('click', (e) => {
    
    if (e.target === $catDeteil){
      console.log('m;k');
      $catDeteil.classList.remove('hidden')
      $catDeteil.classList.add('hidden')
      
    }
  })
  
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        $catDeteil.classList.remove('hidden')
        $catDeteil.classList.add('hidden')
      }
    })
    

  $catDeteil.addEventListener('submit', (submitEvent) => {
    submitEvent.preventDefault()
    
   const catEdit = submitEvent.target.closest('[data-formDeteil]')

   let formEditData = Object.fromEntries(new FormData(catEdit).entries())

formEditData = {
      ...formEditData,
      id: +formEditData.id,
      rate: +formEditData.rate,
      age: +formEditData.age,
      favorite: !!formEditData.favorite,
    }

   let formEditDataId = Object.values(formEditData)
   
let catid = formEditDataId[0]



fetch(`https://cats.petiteweb.dev/api/single/vladislav0282/update/${catid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formEditData),
      }).then((res) => {
        if (res.status === 200) {
          $catDeteil.classList.add('hidden')
          $modalWr.removeEventListener('click', clickModalWrHandler)
          $modalContent.innerHTML = ''

         
          localStorage.removeItem(CREATE_FORM_LS_KEY)
          return $wr.insertAdjacentHTML(
            'afterbegin',
            getCatHTML(formEditData),
          )
        }
        throw Error('Ошибка при создании кота')
      }).catch(alert)
      



    })
  






  




          
    

  
    



    
     
     


    
