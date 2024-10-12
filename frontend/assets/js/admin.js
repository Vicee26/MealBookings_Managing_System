/* TABS */
const main = document.getElementsByTagName("main")[0]; /* lol there isn't getElementByTagName */
const tabsArray = Array.from(main.children);

const refeicoesTab = document.getElementById("refeicoes-tab");
const pratosTab = document.getElementById("pratos-tab");
const marcacoesTab = document.getElementById("marcacoes-tab");
const usersTab = document.getElementById("users-tab");

const way = ["left", "right"];
const status = ["Disable", "Enable"];

window.onload = function () {
    /* Default tab */
    /*openTab(refeicoesTab);*/
    refeicoesTab.style.display = "block";
    pratosTab.style.display = "none";
    marcacoesTab.style.display = "none";
    usersTab.style.display = "none";

    loadReficoes();
    loadMarcacoes();
    loadUsers();
};

// Add event listeners to available plates 
document.getElementById("pratosModal").addEventListener('shown.bs.modal', async function () {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch("http://localhost:3001/api/refeicoes/", {
            method: "GET",
            headers: { 
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Network response was not ok.");
        }

        const data = await response.json();
        const platesModel = document.getElementById("pratos-meal");
        platesModel.innerHTML = "";

        data.forEach(element => { 
            if (element.status){
                platesModel.innerHTML += `<option value="${element.id}">${element.name}</option>`;
            }
        });
        
    } catch (error) {
        console.error("Failed to log in:", error);
    }

  });

  // Add event listeners to available plates 
document.getElementById("marcacoesModal").addEventListener('shown.bs.modal', async function () {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch("http://localhost:3001/api/user/", {
            method: "GET",
            headers: { 
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Network response was not ok.");
        }

        var usersData = await response.json();
        usersData = usersData.data;
        const userModel = document.getElementById("marcacoes-user");
        userModel.innerHTML = "";

        usersData.forEach(element => { 
            if (element.status){
                userModel.innerHTML += `<option value="${element.id}">${element.name}</option>`;
            }
        });
        
    } catch (error) {
        console.error("Failed to log in:", error);
    }

    


    //REFEICOIES
    try {
        const response = await fetch("http://localhost:3001/api/refeicoes/", {
            method: "GET",
            headers: { 
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Network response was not ok.");
        }

        const data = await response.json();
        const platesModel = document.getElementById("marcacoes-refeicao");
        platesModel.innerHTML = "";

        data.forEach(element => { 
            if (element.status){
                platesModel.innerHTML += `<option value="${element.id}">${element.name}</option>`;
            }
        });
        
    } catch (error) {
        console.error("Failed to log in:", error);
    }

  });

/*
function openRefeicoes(){
    document.getElementById("refeicoes-tab").style.display = "block";
    document.getElementById("pratos-tab").style.display = "none";
    document.getElementById("marcacoes-tab").style.display = "none";
    
}

function openPratos(){
    document.getElementById("refeicoes-tab").style.display = "none";
    document.getElementById("pratos-tab").style.display = "block";
    document.getElementById("marcacoes-tab").style.display = "none";
}

function openMarcacoes(){
    document.getElementById("refeicoes-tab").style.display = "none";
    document.getElementById("pratos-tab").style.display = "none";
    document.getElementById("marcacoes-tab").style.display = "block";
}
*/

/* Problably overcomplicated this, but this way is more modular */
function openTab(tabElement) {    
    var activeTab = tabsArray.find(tab => tab.style.display === "block");
    /* first run ig, i dont like it tho */
    if (!activeTab) {
        tabElement.style.display = "block";
        return;
    }

    if (activeTab === tabElement) return;
    
    const tabIndex = tabsArray.indexOf(tabElement);
    const activeTabIndex = tabsArray.indexOf(activeTab);

    animateElement(activeTab, "out", way[tabIndex > activeTabIndex ? 1 : 0]);

    tabElement.style.display = "block";
    animateElement(tabElement, "in", way[tabIndex > activeTabIndex ? 1 : 0]);
}

function animateElement(element, type, direction) {  
    // Add the new animation class
    const animationClass = `slide-${type}-${direction}`;

    const animationEnd = function() {
        element.classList.remove(animationClass);
        if (type === "out") element.style.display = "none";
        element.removeEventListener('animationend', animationEnd);
    }

    element.removeEventListener('animationend', animationEnd);
    
    element.classList.add(animationClass);
    element.addEventListener('animationend', animationEnd);
  }

/* MODALS */
function openRefeicoesEditModal(id, name, description, status) {
    document.getElementById("refeicoes-id").value = id;
    document.getElementById("refeicoes-name").value = name;
    document.getElementById("refeicoes-desc").value = description;
    document.getElementById("refeicoes-status").value = status;
  
    const taskModal = new bootstrap.Modal(document.getElementById("refeicoesModal"));
    taskModal.show();

    // Bind the form submission event
    document.getElementById("refeicoes-form").onsubmit = function (event) {
        event.preventDefault();
        updateRefeicao(id); // Update task and refresh the list
    };
}

function openPratosEditModal(id, meal_id, type, date) {
    document.getElementById("pratos-id").value = id;
    document.getElementById("pratos-meal").value = meal_id;
    document.getElementById("pratos-type").value = type;
    document.getElementById("pratos-date").value = date;
  
    const taskModal = new bootstrap.Modal(document.getElementById("pratosModal"));
    taskModal.show();
}

function openMarcacoesEditModal(id, hora, refeicao) {
    document.getElementById("marcacoes-id").value = id;
    document.getElementById("marcacoes-hora").value = hora;
    document.getElementById("marcacoes-refeicao").value = refeicao;
  
    const taskModal = new bootstrap.Modal(document.getElementById("marcacoesModal"));
    taskModal.show();
}

function openUsersEditModal(id, name, email, password, status, role) {
    document.getElementById("users-id").value = id;
    document.getElementById("users-name").value = name;
    document.getElementById("users-email").value = email;
    document.getElementById("users-password").value = password;
    /*
    document.getElementById("users-status").value = status;
    document.getElementById("users-role").value = role;
    */
  
    const taskModal = new bootstrap.Modal(document.getElementById("usersModal"));
    taskModal.show();

    document.getElementById("users-form").onsubmit = function (event) {
        event.preventDefault();
        updateUsers(id); // Update task and refresh the list
    };
}

// Refeicoes
async function loadReficoes(){
    const token = localStorage.getItem("token");
    try {
        const response = await fetch("http://localhost:3001/api/refeicoes/", {
            method: "GET",
            headers: { 
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Network response was not ok.");
        }

        const data = await response.json();
        const refeicoes = document.getElementById("refeicoes-list");
        refeicoes.innerHTML = "";
        
                    /*
                    <span class="task-details">
                        <span class="badge bg-secondary">${status[element.status]}</span>
                    </span>
                    */

        data.forEach(element => { 
            refeicoes.innerHTML += `
            <li class="list-group-item">
                    <strong>${element.name}</strong> - <span>${element.description}</span>
                    <div class="btn-group btn-group-sm float-right">
                        <button class="btn btn-info" onclick="openRefeicoesEditModal(${element.id}, '${element.name}', '${element.description}', '${status[element.status]}')">Edit</button>
                        <button class="btn btn-${element.status ? "danger" : "success" }" onclick="changeStatusRefeicao(${element.id}, '${status[+!element.status]}')">${status[+!element.status]}</button>
                    </div>
                </li>
                `;
        });
        
    } catch (error) {
        console.error("Failed to log in:", error);
    }
}

async function addRefeicao(){
    const token = localStorage.getItem("token");
    const name = document.getElementById("refeicoes-name").value;
    const description =  document.getElementById("refeicoes-desc").value;
  
    if (!name || !description) {
      alert("Please fill in all fields.");
      return;
    }
  
    const updatedTask = {
        name: name,
        description: description,
    };
  
    try {
      const response = await fetch(`http://localhost:3001/api/refeicoes/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedTask),
      });
  
      if (!response.ok) {
        throw new Error("Failed to add.");
      }
  
      document.getElementById("refeicoes-form").reset(); // Clear the form
      loadReficoes(); // Refresh the task list
      const taskModal = bootstrap.Modal.getInstance(document.getElementById("refeicoesModal"));
      taskModal.hide(); // Close the modal
    } catch (error) {
      console.error("Failed to add:", error);
    }
}

async function updateRefeicao(id) {
    const token = localStorage.getItem("token");
    const name = document.getElementById("refeicoes-name").value;
    const description =  document.getElementById("refeicoes-desc").value;
    const status = document.getElementById("refeicoes-status").value;
  
    if (!name || !description) {
      alert("Please fill in all fields.");
      return;
    }
  
    const updatedTask = {
        name: name,
        description: description,
        status: status == "Active" ? 1 : 0
    };
  
    try {
      const response = await fetch(`http://localhost:3001/api/refeicoes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedTask),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update.");
      }
  
      document.getElementById("refeicoes-form").reset(); // Clear the form
      loadReficoes(); // Refresh the task list
      const taskModal = bootstrap.Modal.getInstance(document.getElementById("refeicoesModal"));
      taskModal.hide(); // Close the modal
    } catch (error) {
      console.error("Failed to update:", error);
    }
  }

  async function changeStatusRefeicao(id, status) {
    try {
        const response = await fetch(`http://localhost:3001/api/refeicoes/${id}/${status.toLowerCase()}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
    
        if (!response.ok) {
          throw new Error("Failed to change status.");
        }
    
        loadReficoes(); // Refresh the task list

      } catch (error) {
        console.error("Failed to change status:", error);
      }
    
  }

// Pratos
/* CALENDAR */
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
}
/*overwriting the function from index.js*/
/* openForm works as loadPlates */
async function openForm(data){
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`http://localhost:3001/api/refeicoes-dia/${data}`, {
            method: "GET",
            headers: { 
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Network response was not ok.");
        }

        const pratosList = await response.json();
        const pratos = document.getElementById("pratos-list");
        pratos.innerHTML = "";
        
                    /*
                    <span class="task-details">
                        <span class="badge bg-secondary">${status[element.status]}</span>
                    </span>
                    */
        if (pratosList.length === 0 || !Array.isArray(pratosList)){
            pratos.innerHTML += `<li class="list-group-item">No meals booked for the selected day.</li>`;
            return;
        }

        pratosList.forEach(element => { 
            pratos.innerHTML += `
            <li class="list-group-item">
                    <strong>${element.name}</strong> - <span>${element.type}</span>
                    <div class="btn-group btn-group-sm float-right">
                        <button class="btn btn-info" onclick="openPratosEditModal(${element.id},'${element.meal_id}', '${element.type}', '${element.data}')">Edit</button>
                        <button class="btn btn-danger" onclick="deletePrato(${element.id})">Delete</button>
                    </div>
                </li>
                `;
        });
        
    } catch (error) {
        console.error("Failed to log in:", error);
    }

}

async function addPrato(){
    const token = localStorage.getItem("token");
    const meal_id = document.getElementById("pratos-meal").value;
    const type =  document.getElementById("pratos-type").value;
    const date =  document.getElementById("pratos-date").value;
  
    const updatedTask = {
        meal_id: meal_id,
        type: type,
        date: date
    };
  
    try {
      const response = await fetch(`http://localhost:3001/api/refeicoes-dia/day-meal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedTask),
      });
  
      if (!response.ok) {
        throw new Error("Failed to add.");
      }
  
      document.getElementById("pratos-form").reset(); // Clear the form
      loadReficoes(date); // Refresh the task list
      const taskModal = bootstrap.Modal.getInstance(document.getElementById("pratosModal"));
      taskModal.hide(); // Close the modal
    } catch (error) {
      console.error("Failed to add:", error);
    }
}

// Marcacoes
async function loadMarcacoes(){
    const token = localStorage.getItem("token");
    try {
        const response = await fetch("http://localhost:3001/api/marcacoes/index", {
            method: "GET",
            headers: { 
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Network response was not ok.");
        }

        const data = await response.json();
        const marcacoes = document.getElementById("marcacoes-list");
        marcacoes.innerHTML = "";
        
        if (marcacoes.length === 0 || !Array.isArray(marcacoes)){
            pratos.innerHTML += `<li class="list-group-item">No meals booked.</li>`;
            return;
        }

        data.forEach(element => { 
            marcacoes.innerHTML += `
            <li class="list-group-item">
                    <strong>${element.meal_name}</strong> - <span>${element.meal_type}</span>

                    <div class="btn-group btn-group-sm float-right">
                        <button class="btn btn-info" onclick="openRefeicoesEditModal(${element.id}, '${element.meal_type}', '${element.meal_name}')">Edit</button>
                        <button class="btn btn-danger" onclick="deleteMarcacao(${element.id})">Delete</button>
                    </div>
                </li>
                `;
        });
        
    } catch (error) {
        console.error("Failed to log in:", error);
    }
}

async function deleteMarcacao(id) {
    try {
        const response = await fetch(`http://localhost:3001/api/marcacoes/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
    
        if (!response.ok) {
          throw new Error("Failed to delete.");
        }
    
        loadMarcacoes(); // Refresh the task list

      } catch (error) {
        console.error("Failed to delete:", error);
      }
    
  }
  
async function addMarcacao(){
    const token = localStorage.getItem("token");
    const user_id = document.getElementById("marcacoes-user").value;
    const booking_schedule = document.getElementById("marcacoes-hora").value;
    const day_meals_id = document.getElementById("marcacoes-refeicao").value;
    

    if (!booking_schedule || !day_meals_id) {
      alert("Please fill in all fields.");
      return;
    }

      // Create a new booking object
      const newBooking = {
          user_id: user_id,
          day_meals_id: day_meals_id,
          booking_schedule: booking_schedule
      };

      // Send the booking request
      const response = await fetch("http://localhost:3001/api/marcacoes", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newBooking),
      });

      

      // Check if the booking response is ok
      if (!response.ok) {
          throw new Error("Failed to create a booking.");
      }

      // Clear the form and refresh the booking list
      document.getElementById("marcacoes-form").reset(); // Clear the form
      loadMarcacoes(); // Refresh the task list

      // Close the modal
      const taskModal = bootstrap.Modal.getInstance(document.getElementById("marcacoesModal"));
      taskModal.hide(); // Close the modal 
      
    
}

// Users
async function loadUsers(){
    const token = localStorage.getItem("token");
    try {
        const response = await fetch("http://localhost:3001/api/user/", {
            method: "GET",
            headers: { 
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Network response was not ok.");
        }

        var data = await response.json();
        data = data.data;
        const users = document.getElementById("users-list");
        users.innerHTML = "";
        console.log(data);
        if (data.length === 0 || !Array.isArray(data)){
            users.innerHTML += `<li class="list-group-item">No users registered.</li>`;
            return;
        }

        data.forEach(element => { 
            users.innerHTML += `
            <li class="list-group-item">
                    <strong>${element.name}</strong> - <span>${element.email}</span>
                    <div class="btn-group btn-group-sm float-right">
                        <button class="btn btn-info" onclick="openUsersEditModal(${element.id}, '${element.name}', '${element.email}', '${element.password}', '${status[element.status]}', '${element.role}')">Edit</button>
                        <button class="btn btn-danger" onclick="deleteUser(${element.id})">Delete</button>
                    </div>
                </li>
                `;
        }
        );
    } catch (error) {
        console.error("Failed to log in:", error);
    }
}

async function addUser(){
    const name = document.getElementById("users-name").value;
    const email =  document.getElementById("users-email").value;
    const password =  document.getElementById("users-password").value;
    /*
    const status =  document.getElementById("users-status").value;
    const role =  document.getElementById("users-role").value;
    */
  
    const updatedTask = {
        name: name,
        email: email,
        password: password
        /*
        status: status == "Active" ? 1 : 0,
        role: role
        */
    };

    try {
      const response = await fetch(`http://localhost:3001/api/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      });
  
      if (!response.ok) {
        throw new Error("Failed to add.");
      }
  
      document.getElementById("users-form").reset(); // Clear the form
      loadUsers(); // Refresh the task list
      const taskModal = bootstrap.Modal.getInstance(document.getElementById("usersModal"));
      taskModal.hide(); // Close the modal
    } catch (error) {
      console.error("Failed to add:", error);
    }
    
}

async function updateUsers(id) {
    const token = localStorage.getItem("token");
    const name = document.getElementById("users-name").value;
    const email =  document.getElementById("users-email").value;
    const password =  document.getElementById("users-password").value;

    const updatedTask = {
        name: name,
        email: email,
        password: password,
        //rip consistency
        role: 1,
        status: 1
    };
  
    try {
      const response = await fetch(`http://localhost:3001/api/user/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedTask),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update.");
      }
  
      document.getElementById("users-form").reset(); // Clear the form
      loadUsers(); // Refresh the task list
      const taskModal = bootstrap.Modal.getInstance(document.getElementById("usersModal"));
      taskModal.hide(); // Close the modal
    } catch (error) {
      console.error("Failed to update:", error);
    }
  }

  async function deleteUser(id) {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`http://localhost:3001/api/user/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
    
        if (!response.ok) {
          throw new Error("Failed to delete.");
        }
    
        loadUsers(); // Refresh the task list

      } catch (error) {
        console.error("Failed to delete:", error);
      }
  }

  async function exportUsers(){
    const token = localStorage.getItem("token");
    try {
        const response = await fetch("http://localhost:3001/api/exports/users-pdf", {
            method: "GET",
            headers: { 
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Network response was not ok.");
        }

        response.blob().then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'users.pdf';
            a.click();
        });
        
    } catch (error) {
        console.error("Failed to log in:", error);
    }
  }