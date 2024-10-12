

const token_index = localStorage.getItem("token");

//Calendar Structure
const daysTag = document.querySelector(".days"),
currentDate = document.querySelector(".current-date"),
prevNextIcon = document.querySelectorAll(".icons span");


let date = new Date(),
currYear = date.getFullYear(),
currMonth = date.getMonth();


const months = ["January", "February", "March", "April", "May", "June", "July",
              "August", "September", "October", "November", "December"];

const renderCalendar = () => {
    let firstDayofMonth = new Date(currYear, currMonth, 1).getDay(), 
    lastDateofMonth = new Date(currYear, currMonth + 1, 0).getDate(), 
    lastDayofMonth = new Date(currYear, currMonth, lastDateofMonth).getDay(), 
    lastDateofLastMonth = new Date(currYear, currMonth, 0).getDate(); 
    let liTag = "";

    for (let i = firstDayofMonth; i > 0; i--) { 
        liTag += `<li class="inactive">${lastDateofLastMonth - i + 1}</li>`;
    }

    for (let i = 1; i <= lastDateofMonth; i++) { 

        let isToday = i === date.getDate() && currMonth === new Date().getMonth() 
                     && currYear === new Date().getFullYear() ? "active" : "";
        let mes = currMonth +1;


        /* Testar código */
        if(mes<10){
          mes= `0${mes}`;
        }
        if(i<10){
          i= `0${i}`;
        }


        liTag += `<li id="${currYear}-${mes}-${i}" onclick="openForm('${currYear}-${mes}-${i}')">${i}</li>`;

        
         
    }

    for (let i = lastDayofMonth; i < 6; i++) { 
        liTag += `<li class="inactive">${i - lastDayofMonth + 1}</li>`
    }
    currentDate.innerText = `${months[currMonth]} ${currYear}`;
    daysTag.innerHTML = liTag;

    getBookingsByID();
}
renderCalendar();

prevNextIcon.forEach(icon => { 
    icon.addEventListener("click", () => { 
        
        currMonth = icon.id === "prev" ? currMonth - 1 : currMonth + 1;

        if(currMonth < 0 || currMonth > 11) { 
            
            date = new Date(currYear, currMonth, new Date().getDate());
            currYear = date.getFullYear(); 
            currMonth = date.getMonth(); 
        } else {
            date = new Date(); 
        }
        renderCalendar(); 
    });
});


//End of Calendar Structure




 
async function openForm(data) {

    //verificar se está a 15 dias da marcação
    const dataAtual = new Date();
    const ano = dataAtual.getFullYear();
    const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
    const dia = String(dataAtual.getDate()).padStart(2, '0');
    const dataFormatada = `${ano}-${mes}-${dia}`;

    let dataMilisegundos = new Date(data);
    let dataFormatadaMl = new Date(dataFormatada);

    const umDiaEmMilissegundos = 1000 * 60 * 60 * 24;
    const diferencaEmMilissegundos = Math.abs(dataMilisegundos.getTime() - dataFormatadaMl.getTime()); // Diferença absoluta

    dataMilisegundos = dataMilisegundos.getTime();
    dataFormatadaMl = dataFormatadaMl.getTime();

    // Converte a diferença de milissegundos para dias
    const diferencaEmDias = diferencaEmMilissegundos / umDiaEmMilissegundos;
    console.log(diferencaEmDias);

    if(diferencaEmDias < 15){
      return alert("You can only add, update and delete bookings 15 days in advance.");
    }
    if(dataFormatadaMl > dataMilisegundos){
      return alert("You can't add, update or delete bookings in past days.");
    }



    const response = await fetch(`http://localhost:3001/api/refeicoes-dia/${data}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token_index}`
      }
    });
    const meals = await response.json();

    

    if(meals.meals != null){
      
      const verification = await fetch(`http://localhost:3001/api/marcacoes/verify-booking/${data}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token_index}`
        }
      });
      const verify = await verification.json();
      //console.log(verify);
      const day_meals_id = verify.bookings;

      const select = document.getElementById('opcao-ref');
      select.innerHTML = "";

      const btn_del= document.getElementById('btn-delete');
      if(btn_del){
        btn_del.remove();
      }


      if(day_meals_id === undefined){

        const schedule = document.getElementById('schedulePlaceholder');
        schedule.selected = "true";

        const placeholder = document.createElement('option');
        placeholder.value = "";
        placeholder.disabled = "true";
        placeholder.selected = "true";
        placeholder.textContent = "Choose a meal:";
        select.appendChild(placeholder);

        meals.meals.forEach(meal => {
          
          let option = document.createElement('option');
          option.value = `${meal.id}`;
          option.textContent = `${meal.type}: ${meal.name}`;

          select.appendChild(option);
        

        });

        const marcModal = new bootstrap.Modal(document.getElementById("marcModal"));
        const button = document.getElementById("btn-form");
        button.textContent = "Add Booking";
        const title = document.getElementById("marcModalLabel");
        title.textContent = "Add Booking";
        marcModal.show();
        
        // Bind the form submission event
        document.getElementById("marc-form").onsubmit = function (event) {
            event.preventDefault();
            addBooking(event); // Update task and refresh the list
        };
      }else{

        if(day_meals_id[0].booking_schedule == 1){
          const schedule = document.getElementById('lunch');
          schedule.selected= "true";
        }else if(day_meals_id[0].booking_schedule == 2){
          const schedule = document.getElementById('dinner');
          schedule.selected= "true";
        }else{
          alert('schedule invalid!');
        }
        const placeholder = document.createElement('option');
        placeholder.value = "";
        placeholder.disabled = "true";
        placeholder.textContent = "Choose a meal:";
        select.appendChild(placeholder);


        meals.meals.forEach(meal => {
          if(day_meals_id[0].day_meals_id == meal.id){
            let option = document.createElement('option');
            option.value = `${meal.id}`;
            option.textContent = `${meal.type}: ${meal.name}`;
            option.selected="true";
            select.appendChild(option);
          }else{
            let option = document.createElement('option');
            option.value = `${meal.id}`;
            option.textContent = `${meal.type}: ${meal.name}`;
            select.appendChild(option);
          }
        });

        const marcModal = new bootstrap.Modal(document.getElementById("marcModal"));
        const button = document.getElementById("btn-form");
        button.textContent = "Update Booking";
        const title = document.getElementById("marcModalLabel");
        title.textContent = "Update Booking";
        const form = document.getElementById("marc-form");
        let btn = document.createElement('button');
        btn.id = 'btn-delete';
        btn.data = `${data}`;
        btn.classList.add('btn');
        btn.classList.add('btn-danger');


        //DELETE BUTTON
        btn.addEventListener('click', function (event) {
          event.preventDefault(); // Previne o comportamento padrão do formulário
          deleteBooking();  // Chama a função de deletar com o ID
      });

        
        btn.textContent = "Delete Booking";
        form.appendChild(btn);
        
        marcModal.show();
        
        // Bind the form submission event
        document.getElementById("marc-form").onsubmit = function (event) {
            event.preventDefault();
            updateBooking(); //update booking
        };
      }
    
    }else{
      alert("No meals for this day.");
    }
    
    
}

//Create new Marcação
async function addBooking() {
    //event.preventDefault();
    const booking_schedule = document.getElementById("tipo-ref").value;
    const day_meals_id = document.getElementById("opcao-ref").value;
    

    if (!booking_schedule || !day_meals_id) {
      alert("Please fill in all fields.");
      return;
    }

      // Create a new booking object
      const newBooking = {
          day_meals_id: day_meals_id,
          booking_schedule: booking_schedule
      };

      // Send the booking request
      const response = await fetch("http://localhost:3001/api/marcacoes", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token_index}`,
          },
          body: JSON.stringify(newBooking),
      });

      

      // Check if the booking response is ok
      if (!response.ok) {
          throw new Error("Failed to create a booking.");
      } else {
          console.log("Booking successfully created.");
          alert("Marcado com sucesso.");
      }

      // Clear the form and refresh the booking list
      document.getElementById("marc-form").reset(); // Clear the form
      fetchMarcs(); // Refresh the task list

      // Close the modal
      const taskModal = bootstrap.Modal.getInstance(document.getElementById("marcModal"));
      taskModal.hide(); // Close the modal 
      
    
  }


async function deleteBooking() {
  const btn = document.getElementById('btn-delete');
  data = btn.data;

  const response = await fetch(`http://localhost:3001/api/marcacoes/booking-id/${data}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token_index}`
    }
  });

  const booking = await response.json();
  //console.log(booking.bookings.id);

  const res = await fetch(`http://localhost:3001/api/marcacoes/del/${booking.bookings.id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token_index}`
    }
  });

  if(!res){
    throw new Error("Network response was not ok.");
  }

  // Clear the form and refresh the booking list
  document.getElementById("marc-form").reset(); // Clear the form
   // Refresh the task list

  // Close the modal
  const taskModal = bootstrap.Modal.getInstance(document.getElementById("marcModal"));
  taskModal.hide(); // Close the modal 
  alert("Booking deleted with success.");
  return true;
  
}

async function updateBooking() {
  const btn = document.getElementById('btn-delete');
  data = btn.data;

  const booking_schedule = document.getElementById("tipo-ref").value;
  const day_meals_id = document.getElementById("opcao-ref").value;

  const response = await fetch(`http://localhost:3001/api/marcacoes/booking-id/${data}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token_index}`
    }
  });

  const booking = await response.json();

  const updateBooking = {
    day_meals_id: day_meals_id,
    booking_schedule: booking_schedule
  };

  const res = await fetch(`http://localhost:3001/api/marcacoes/put/${booking.bookings.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token_index}`
    },
    body: JSON.stringify(updateBooking),
  });

  if(!res){
    throw new Error("Network response was not ok.");
  }

  // Clear the form and refresh the booking list
  document.getElementById("marc-form").reset(); // Clear the form
   // Refresh the task list

  // Close the modal
  const taskModal = bootstrap.Modal.getInstance(document.getElementById("marcModal"));
  taskModal.hide(); // Close the modal 
  alert("Booking updated with success.");
  return true;
  

}



//CHANGE COLOR ON DAYS WITH ACTIVE BOOKINGS
async function getBookingsByID(){
  try {
    const response = await fetch("http://localhost:3001/api/marcacoes/load", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token_index}`
      }
    });

    if (!response.ok) {
      throw new Error("Network response was not ok.");
    }

    const data = await response.json();
    



    data.bookings.forEach(rows =>{
      const data = rows.meal_date

      const elements = document.querySelectorAll(`[id='${data}']`);

      if(elements.length >0){
        elements.forEach(element=>{
          element.classList.add('active');
        });
      }
    });

    
    
    return true;
  } catch (error) {
    console.error("Failed to get dates:", error);
  }
}
